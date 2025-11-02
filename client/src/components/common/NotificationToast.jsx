import React, { useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md'

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-green-400" />
      case 'error':
        return <MdError className="text-red-400" />
      case 'warning':
        return <MdWarning className="text-yellow-400" />
      case 'info':
        return <MdInfo className="text-blue-400" />
      default:
        return null
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-dark-card border-dark-border'
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg p-4 shadow-xl animate-slide-down backdrop-blur-lg`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-xl">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-text">{notification.title}</p>
              <p className="text-sm text-dark-muted mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-dark-muted hover:text-dark-text transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
