import { useCallback } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import client from 'models/api/resources'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isProduction } from 'utils/environment'

export const TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL = isProduction()
    ? 'https://hooks.zapier.com/hooks/catch/24089695/u4cpbo1/'
    : 'https://hooks.zapier.com/hooks/catch/24089695/u4cjmzv/'

type NotificationPayload = {
    userName: string
    userEmail: string
    accountDomain: string
}

const sendTrialExtensionSlackNotification = async (
    payload: NotificationPayload,
) => {
    try {
        await client.post<NotificationPayload>(
            TRIAL_EXTENSION_SLACK_NOTIFICATION_ZAPIER_URL,
            { data: payload },
            {
                transformRequest: (
                    data: NotificationPayload,
                    headers: Record<string, unknown>,
                ) => {
                    // We need this in order to prevent CORS policy error.
                    delete headers['X-CSRF-Token']
                    delete headers['X-Gorgias-User-Client']
                    return JSON.stringify(data)
                },
            },
        )
        return true
    } catch {
        return false
    }
}

export const useNotifyTrialExtensionSlackChannel = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const notifySlackChannel = useCallback(async () => {
        const payload: NotificationPayload = {
            userName: currentUser.get('name') || '',
            userEmail: currentUser.get('email') || '',
            accountDomain: currentAccount.get('domain') || '',
        }

        return sendTrialExtensionSlackNotification(payload)
    }, [currentUser, currentAccount])

    return notifySlackChannel
}
