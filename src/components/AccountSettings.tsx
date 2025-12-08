import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { ArrowLeft, User, Mail, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AccountSettingsProps {
  onClose: () => void
}

export function AccountSettings({ onClose }: AccountSettingsProps) {
  const { user, signOut } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setDeleteLoading(true)
    try {
      // Delete user data first (weddings, events, guests, etc.)
      // This would typically be handled by a cascade delete in the database
      // or a server-side function for security

      // For now, we'll just sign out and inform the user
      // In production, you'd call a secure server endpoint
      const { error } = await supabase.rpc('delete_user_account')

      if (error) {
        // If the RPC doesn't exist, inform user to contact support
        toast.error('Account deletion requires administrator assistance. Please contact support.')
        setDeleteLoading(false)
        return
      }

      await signOut()
      toast.success('Your account has been deleted')
    } catch {
      toast.error('Failed to delete account. Please contact support.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onClose} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      {/* Account Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-gray-400" />
          Account Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Account Created
            </label>
            <span className="text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Last Sign In
            </label>
            <span className="text-gray-900">
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Danger Zone
        </h2>

        <p className="text-red-700 text-sm mb-4">
          Once you delete your account, there is no going back. All your weddings,
          events, guests, photos, and RSVPs will be permanently deleted.
        </p>

        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Delete Your Account?
          </h2>

          <p className="text-gray-600 text-center mb-4">
            This action is <strong>permanent</strong> and cannot be undone. All your data will be deleted.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium mb-2">
              This will permanently delete:
            </p>
            <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
              <li>All your weddings and events</li>
              <li>Guest lists and RSVPs</li>
              <li>Uploaded photos and AI analysis</li>
              <li>Invitation tokens and links</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowDeleteConfirm(false)
                setConfirmText('')
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || confirmText !== 'DELETE'}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Forever
                </>
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
