import {AxiosError} from 'axios'
import {
    Notification,
    NotificationButton,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import history from 'pages/history'

export const transformBundleError = (
    error: AxiosError | unknown,
    errorMessage: string,
    integration_id?: number
): Notification => {
    const responseError = error as AxiosError<{
        error?: {msg: string}
    }>
    let message = errorMessage
    let buttons: NotificationButton[] = []

    if (responseError.response?.status === 400) {
        message = responseError.response?.data.error?.msg || message
        if (message.includes('permission') && integration_id) {
            buttons = [
                {
                    name: 'Update permissions',
                    onClick: () => {
                        history.push(
                            `/app/settings/integrations/shopify/${integration_id}`
                        )
                    },
                    primary: false,
                },
            ]
        }
    }
    return {
        style: NotificationStyle.Alert,
        buttons: buttons,
        status: NotificationStatus.Error,
        message: message,
        noAutoDismiss: true,
        closeOnNext: true,
    }
}
