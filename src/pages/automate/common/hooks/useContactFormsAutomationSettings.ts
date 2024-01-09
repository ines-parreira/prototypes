import {useEffect} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getContactFormsAutomationSettings} from 'state/entities/contactForm/contactFormsAutomationSettings'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {ContactFormAutomationSettings} from 'models/contactForm/types'

const useContactFormsAutomationSettings = (contactFormIds: number[]) => {
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
    ] = useAsyncFn(
        async (contactFormIds: number[]) => {
            if (!isReady) {
                return
            }

            try {
                await Promise.all(
                    contactFormIds.map((contactFormId) =>
                        fetchAutomationSettingsByContactFormId(contactFormId)
                    )
                )
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [isReady]
    )

    const [
        {loading: isUpdatePending},
        handleContactFormAutomationSettingsUpdate,
    ] = useAsyncFn(
        async (
            contactFormId: number,
            automationSettings: Partial<ContactFormAutomationSettings>
        ) => {
            try {
                await upsertAutomationSettingsByContactFormId(
                    contactFormId,
                    automationSettings
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
        const valuesMissing = contactFormIds.filter(
            (id) => !(id.toString() in contactFormsAutomationSettings)
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
