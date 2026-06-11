import type { AxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import { errorToChildren } from 'utils'

import { CustomNotifications } from '../constants'

const stripHtmlTags = (message: string) =>
    message.replace(/<[^>]*>/g, '').trim()

export function useCreatePhoneNumberNotifications() {
    const showCreatePhoneNumberErrorNotification = ({
        error,
    }: {
        error: any
    }) => {
        const upgradePlanPath = '/app/settings/billing/process/helpdesk'

        const { response } = error as AxiosError<{
            error: { msg: string; data: { use_custom: string | null } }
        }>
        const customNotificationName = response?.data?.error?.data?.use_custom
        if (customNotificationName === CustomNotifications.UPGRADE_MESSAGE) {
            toast.error('Cannot add phone number.', {
                caption: `Upgrade your account or subscribe to the Add-on to use the integration here: ${upgradePlanPath}.`,
            })
            return
        }

        const errors = errorToChildren(error)
        const title =
            response?.data?.error?.msg ?? 'Failed to create phone number'
        toast.error(title, {
            caption: stripHtmlTags(String(errors ?? '')),
        })
    }

    return { showCreatePhoneNumberErrorNotification }
}
