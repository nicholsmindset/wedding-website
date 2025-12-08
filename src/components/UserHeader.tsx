import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoutConfirmDialog } from '@/components/LogoutConfirmDialog'
import { Heart, LogOut, Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UserHeaderProps {
  onSettingsClick?: () => void
}

export function UserHeader({ onSettingsClick }: UserHeaderProps) {
  const { user } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <Heart className="h-7 w-7 text-pink-500 mr-2" />
              <span className="text-xl font-bold text-gray-900">Dream Wedding Day</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 hidden sm:block max-w-[150px] truncate">
                  {user?.email}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Signed in as</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {onSettingsClick && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          onSettingsClick()
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Account Settings
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowLogoutDialog(true)
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </>
  )
}
