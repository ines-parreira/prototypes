import { useEffect } from 'react'

import { useAsyncFn } from '@repo/hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ContactFormAutomationSettings } from 'models/contactForm/types'
import { useContactFormApi } from 'pages/settings/contactForm/hooks/useContactFormApi'
import {
    contactFormsAutomationSettingsFetched,
    getContactFormsAutomationSettings,
} from 'state/entities/contactForm/contactFormsAutomationSettings'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useContactFormsAutomationSettings = (contactFormIds: number[]) => {
    const dispatch = useAppDispatch()
    const {
        isReady,
        fetchAutomationSettingsByContactFormId,
        upsertAutomationSettingsByContactFormId,
    } = useContactFormApi()

    const contactFormsAutomationSettings = useAppSelector(
        getContactFormsAutomationSettings,
    )

    const [
        { loading: isFetchPending },
        handleContactFormAutomationSettingsFetch,
    ] = useAsyncFn(
        async (contactFormIds: number[]) => {
            if (!isReady) {
                return
            }

            try {
                const responses = await Promise.all(
                    contactFormIds.map((contactFormId) =>
                        fetchAutomationSettingsByContactFormId(contactFormId),
                    ),
                )
                const automationSettingsIdMap = responses
                    .filter(
                        (
                            response,
                        ): response is {
                            type: string
                            payload: {
                                contactFormId: string
                                automationSettings: ContactFormAutomationSettings
                            }
                        } => Boolean(response?.payload),
                    )
                    .map((response) => response?.payload)

                void dispatch(
                    contactFormsAutomationSettingsFetched(
                        automationSettingsIdMap,
                    ),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to fetch',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [isReady],
    )

    const [
        { loading: isUpdatePending },
        handleContactFormAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            contactFormId: number,
            automationSettings: Partial<ContactFormAutomationSettings>,
            notificationMessage?: string,
        ) => {
            try {
                await upsertAutomationSettingsByContactFormId(
                    contactFormId,
                    automationSettings,
                )

                void dispatch(
                    notify({
                        message: notificationMessage ?? 'Successfully updated',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch {
                void dispatch(
                    notify({
                        message: 'Failed to update',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        },
        [],
    )

    useEffect(() => {
        const valuesMissing = contactFormIds.filter(
            (id) => !(id.toString() in contactFormsAutomationSettings),
        )

        if (valuesMissing.length) {
            void handleContactFormAutomationSettingsFetch(valuesMissing)
        }
    }, [
        contactFormIds,
        contactFormsAutomationSettings,
        handleContactFormAutomationSettingsFetch,
    ])

    return {
        isFetchPending,
        isUpdatePending,
        contactFormsAutomationSettings,
        handleContactFormAutomationSettingsFetch,
        handleContactFormAutomationSettingsUpdate,
    }
}

export default useContactFormsAutomationSettings
