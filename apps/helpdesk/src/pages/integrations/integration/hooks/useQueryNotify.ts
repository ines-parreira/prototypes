import { useEffect } from 'react'

import { toast } from '@gorgias/axiom'

import { useSearch } from 'hooks/useSearch'

type ToastIntent = 'success' | 'error' | 'info' | 'warning'

function notifyByIntent(intent: ToastIntent | undefined, message: string) {
    switch (intent) {
        case 'success':
            toast.success(message)
            return
        case 'warning':
            toast.warning(message)
            return
        case 'error':
            toast.error(message)
            return
        case 'info':
        default:
            toast.info(message)
    }
}

// Display a notification based on some query params
export default function useQueryNotify() {
    const search = useSearch<{
        error?: string
        message?: string
        message_type?: ToastIntent
    }>()
    useEffect(() => {
        const { message, message_type, error } = search

        if (error === 'need_scope_update') {
            notifyByIntent(
                message_type ?? 'error',
                'You need to update your app permissions in order to do that.',
            )
        }

        if (message) {
            notifyByIntent(
                message_type,
                decodeURIComponent(message.replace(/\+/g, ' ')),
            )
        }
    }, [search])
}
