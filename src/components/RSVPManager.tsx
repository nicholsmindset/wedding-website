import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Mail, Plus, Users, Send, CheckCircle, XCircle, Clock, Copy, Download, Eye, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { Wedding, Guest, RSVP, Event } from '@/lib/supabase'
import { generateRSVPInvitationEmail } from '@/utils/emailTemplates'
import { generateSecureToken, generateMagicLinkUrl, getTokenExpirationDate } from '@/lib/tokens'
import { sendEmail } from '@/lib/email'

interface RSVPManagerProps {
  wedding: Wedding
  events: Event[]
  onUpdate?: () => void
}

interface InvitationData {
  email: string
  name: string
  message?: string
}

interface EmailPreviewData {
  subject: string
  html: string
  text: string
  recipient: string
  email: string
}

type StatusFilter = 'all' | 'confirmed' | 'declined' | 'pending' | 'not_invited'

export function RSVPManager({ wedding, events, onUpdate }: RSVPManagerProps) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [, setLoading] = useState(true)
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false)
  const [invitations, setInvitations] = useState<InvitationData[]>([{ email: '', name: '' }])
  const [sendingInvitations, setSendingInvitations] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewData, setPreviewData] = useState<EmailPreviewData | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    fetchGuestsAndRSVPs()
  }, [wedding.id])

  const fetchGuestsAndRSVPs = async () => {
    try {
      setLoading(true)
      
      // Fetch guests
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('name', { ascending: true })

      if (guestsError) throw guestsError
      setGuests(guestsData || [])

      // Fetch RSVPs
      const { data: rsvpsData, error: rsvpsError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('wedding_id', wedding.id)

      if (rsvpsError) throw rsvpsError
      setRsvps(rsvpsData || [])

    } catch (error) {
      console.error('Error fetching guests and RSVPs:', error)
      toast.error('Failed to load guest information')
    } finally {
      setLoading(false)
    }
  }

  const addInvitationField = () => {
    setInvitations([...invitations, { email: '', name: '' }])
  }

  const updateInvitation = (index: number, field: keyof InvitationData, value: string) => {
    const updated = [...invitations]
    updated[index][field] = value
    setInvitations(updated)
  }

  const removeInvitation = (index: number) => {
    if (invitations.length > 1) {
      setInvitations(invitations.filter((_, i) => i !== index))
    }
  }

  const generateMagicLink = (email: string): { url: string; token: string } => {
    const token = generateSecureToken()
    const url = generateMagicLinkUrl(wedding.id, email, token)
    return { url, token }
  }

  const sendInvitations = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event for the invitations')
      return
    }

    const validInvitations = invitations.filter(inv => inv.email && inv.name)
    if (validInvitations.length === 0) {
      toast.error('Please add at least one valid invitation')
      return
    }

    try {
      setSendingInvitations(true)

      // Create guests and send invitations
      for (const invitation of validInvitations) {
        // Check if guest already exists
        const { data: existingGuest } = await supabase
          .from('guests')
          .select('id')
          .eq('wedding_id', wedding.id)
          .eq('email', invitation.email)
          .single()

        let guestId = existingGuest?.id

        // Create guest if doesn't exist
        if (!guestId) {
          const { data: newGuest, error: guestError } = await supabase
            .from('guests')
            .insert([{
              wedding_id: wedding.id,
              name: invitation.name,
              email: invitation.email
            }])
            .select()
            .single()

          if (guestError) {
            console.error('Error creating guest:', guestError)
            continue
          }
          guestId = newGuest.id
        }

        // Create RSVP record with pending status
        const { error: rsvpError } = await supabase
          .from('rsvps')
          .insert([{
            wedding_id: wedding.id,
            guest_id: guestId,
            event_id: selectedEvent,
            status: 'pending'
          }])

        if (rsvpError) {
          console.error('Error creating RSVP:', rsvpError)
          continue
        }

        // Generate secure magic link
        const { url: magicLink, token } = generateMagicLink(invitation.email)

        // Store the invitation token in database for verification
        const { error: tokenError } = await supabase.from('invitation_tokens').insert([{
          wedding_id: wedding.id,
          guest_id: guestId,
          email: invitation.email,
          token: token,
          expires_at: getTokenExpirationDate(30) // 30 days
        }])

        if (tokenError) {
          console.error('Error storing invitation token:', tokenError)
          continue
        }

        // Get event data for email
        const selectedEventData = events.find(e => e.id === selectedEvent)
        if (!selectedEventData) continue

        // Generate email content
        const emailContent = generateRSVPInvitationEmail({
          wedding,
          guest: {
            id: guestId,
            wedding_id: wedding.id,
            name: invitation.name,
            email: invitation.email,
            phone: null,
            dietary_restrictions: null,
            plus_one: false,
            created_at: '',
            updated_at: ''
          },
          event: selectedEventData,
          magicLink,
          customMessage: invitation.message
        })

        // Send email using email service
        const emailResult = await sendEmail({
          to: invitation.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })

        if (!emailResult.success) {
          console.error(`Failed to send email to ${invitation.email}:`, emailResult.error)
        }
      }

      toast.success(`${validInvitations.length} invitations sent successfully!`)
      setInvitationDialogOpen(false)
      setInvitations([{ email: '', name: '' }])
      fetchGuestsAndRSVPs()
      onUpdate?.()

    } catch (error) {
      console.error('Error sending invitations:', error)
      toast.error('Failed to send some invitations')
    } finally {
      setSendingInvitations(false)
    }
  }

  const copyMagicLink = async (email: string, guestId: string) => {
    const { url: magicLink, token } = generateMagicLink(email)

    // Store the new token in the database
    const { error } = await supabase.from('invitation_tokens').insert([{
      wedding_id: wedding.id,
      guest_id: guestId,
      email: email,
      token: token,
      expires_at: getTokenExpirationDate(30)
    }])

    if (error) {
      toast.error('Failed to generate invitation link')
      return
    }

    navigator.clipboard.writeText(magicLink)
    toast.success('Invitation link copied to clipboard!')
  }

  const previewEmail = (invitation: InvitationData) => {
    if (!selectedEvent) {
      toast.error('Please select an event first')
      return
    }

    const selectedEventData = events.find(e => e.id === selectedEvent)
    if (!selectedEventData) return

    // For preview, generate a placeholder link (actual token will be created on send)
    const { url: magicLink } = generateMagicLink(invitation.email)
    const emailContent = generateRSVPInvitationEmail({
      wedding,
      guest: { id: '', wedding_id: wedding.id, name: invitation.name, email: invitation.email, phone: null, dietary_restrictions: null, plus_one: false, created_at: '', updated_at: '' },
      event: selectedEventData,
      magicLink,
      customMessage: invitation.message
    })

    setPreviewData({
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      recipient: invitation.name,
      email: invitation.email
    })
    setPreviewDialogOpen(true)
  }

  const getRSVPStatus = (guestId: string) => {
    const guestRsvps = rsvps.filter(r => r.guest_id === guestId)
    if (guestRsvps.length === 0) return 'not_invited'
    
    const hasPending = guestRsvps.some(r => r.status === 'pending')
    const hasConfirmed = guestRsvps.some(r => r.status === 'confirmed')
    const hasDeclined = guestRsvps.some(r => r.status === 'declined')
    
    if (hasConfirmed) return 'confirmed'
    if (hasDeclined) return 'declined'
    if (hasPending) return 'pending'
    return 'not_invited'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Mail className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'declined': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const exportGuestList = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Dietary Restrictions', 'Plus One'].join(','),
      ...guests.map(guest => {
        const status = getRSVPStatus(guest.id)
        return [
          guest.name,
          guest.email,
          guest.phone || '',
          status,
          guest.dietary_restrictions || '',
          guest.plus_one ? 'Yes' : 'No'
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${wedding.title.replace(/\s+/g, '_')}_guest_list.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Guest list exported!')
  }

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => getRSVPStatus(g.id) === 'confirmed').length,
    declined: guests.filter(g => getRSVPStatus(g.id) === 'declined').length,
    pending: guests.filter(g => getRSVPStatus(g.id) === 'pending').length
  }

  // Filter guests based on search query and status filter
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.phone && guest.phone.includes(searchQuery))

      // Status filter
      const guestStatus = getRSVPStatus(guest.id)
      const matchesStatus = statusFilter === 'all' || guestStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [guests, searchQuery, statusFilter, rsvps])

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Guest Management
          </h2>
          <p className="text-gray-600">Manage your guest list and send invitations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportGuestList}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Invitations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Choose an event...</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.start_time).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {invitations.map((invitation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <Input
                        placeholder="Guest Name"
                        value={invitation.name}
                        onChange={(e) => updateInvitation(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={invitation.email}
                        onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Personal message (optional)"
                      value={invitation.message || ''}
                      onChange={(e) => updateInvitation(index, 'message', e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewEmail(invitation)}
                        disabled={!invitation.email || !invitation.name}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      {invitations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvitation(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addInvitationField}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Guest
                </Button>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setInvitationDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendInvitations}
                    disabled={sendingInvitations}
                    className="flex-1"
                  >
                    {sendingInvitations ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg p-4 text-center transition-all ${statusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-100' : 'bg-blue-50 hover:bg-blue-100'}`}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-600">Total Guests</div>
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`rounded-lg p-4 text-center transition-all ${statusFilter === 'confirmed' ? 'ring-2 ring-green-500 bg-green-100' : 'bg-green-50 hover:bg-green-100'}`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-green-600">Confirmed</div>
        </button>
        <button
          onClick={() => setStatusFilter('declined')}
          className={`rounded-lg p-4 text-center transition-all ${statusFilter === 'declined' ? 'ring-2 ring-red-500 bg-red-100' : 'bg-red-50 hover:bg-red-100'}`}
        >
          <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          <div className="text-sm text-red-600">Declined</div>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`rounded-lg p-4 text-center transition-all ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-100' : 'bg-yellow-50 hover:bg-yellow-100'}`}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {(searchQuery || statusFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results count */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredGuests.length} of {guests.length} guests
          {statusFilter !== 'all' && ` (${statusFilter})`}
        </div>
      )}

      {/* Guest List */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dietary Restrictions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest) => {
              const status = getRSVPStatus(guest.id)
              return (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.phone || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
                    </span>
                  </TableCell>
                  <TableCell>{guest.dietary_restrictions || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMagicLink(guest.email, guest.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        
        {guests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No guests added yet</p>
            <p className="text-sm">Send invitations to start building your guest list</p>
          </div>
        )}

        {guests.length > 0 && filteredGuests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No guests match your search</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Email Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <p className="text-sm text-gray-600">
              Preview for {previewData?.recipient} ({previewData?.email})
            </p>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <div className="p-3 bg-gray-50 rounded-lg border">{previewData.subject}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HTML Version</label>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={previewData.html}
                    className="w-full h-96 border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Version</label>
                <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm whitespace-pre-wrap">
                  {previewData.text}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(previewData.html)
                    toast.success('HTML copied to clipboard!')
                  }}
                >
                  Copy HTML
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}