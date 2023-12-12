import {useEffect, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    contactFormAutomationSettingsFetched,
    contactFormAutomationSettingsUpdated,
    getContactFormsAutomationSettings,
} from 'state/entities/contactForm/contactFormsAutomationSettings'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {ContactFormAutomationSettings} from 'models/contactForm/types'

const useContactFormsAutomationSettings = (contactFormId: number) => {
    const dispatch = useAppDispatch()
    const {
        isReady,
        fetchAutomationSettingsByContactFormId,
        upsertAutomationSettingsByContactFormId,
    } = useContactFormApi()

    const contactFormsAutomationSettings = useAppSelector(
        getContactFormsAutomationSettings
    )

    const [
        {loading: isFetchPending},
        handleContactFormAutomationSettingsFetch,
    ] = useAsyncFn(async () => {
        if (!isReady) {
            return
        }

        try {
            const automationSettings =
                await fetchAutomationSettingsByContactFormId(contactFormId)

            if (automationSettings === null) {
                void dispatch(
                    contactFormAutomationSettingsFetched({
                        contactFormId: contactFormId.toString(),
                        automationSettings: {
                            workflows: [],
                            order_management: {
                                enabled: false,
                            },
                        },
                    })
                )
            }
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [isReady])

    const [
        {loading: isUpdatePending},
        handleContactFormAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (automationSettings: Partial<ContactFormAutomationSettings>) => {
            try {
                const res = await upsertAutomationSettingsByContactFormId(
                    contactFormId,
                    automationSettings
                )

                void dispatch(
                    contactFormAutomationSettingsUpdated({
                        contactFormId: contactFormId.toString(),
                        automationSettings: res,
                    })
                )

                void dispatch(
                    notify({
                        message: 'Successfully updated',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to update',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        []
    )

    useEffect(() => {
        const valueMissing =
            contactFormsAutomationSettings[contactFormId.toString()] ===
            undefined

        if (valueMissing) {
            void handleContactFormAutomationSettingsFetch()
        }
    }, [
        contactFormId,
        contactFormsAutomationSettings,
        handleContactFormAutomationSettingsFetch,
    ])

    return useMemo(
        () => ({
            isFetchPending,
            isUpdatePending,
            automationSettings: contactFormsAutomationSettings[
                contactFormId.toString()
            ] ?? {workflows: []},
            handleContactFormAutomationSettingsFetch,
            handleContactFormAutomationSettingsUpdate,
        }),
        [
            isFetchPending,
            isUpdatePending,
            contactFormId,
            contactFormsAutomationSettings,
            handleContactFormAutomationSettingsFetch,
            handleContactFormAutomationSettingsUpdate,
        ]
    )
}

export default useContactFormsAutomationSettings
