import {useCallback, useMemo} from 'react'

import {CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS} from 'pages/settings/contactForm/constants'

import useContactFormsAutomationSettings from './useContactFormsAutomationSettings'

const useContactFormAutomationSettings = (contactFormId: number) => {
    const contactFormIds = useMemo(() => [contactFormId], [contactFormId])

    const {
        contactFormsAutomationSettings,
        handleContactFormAutomationSettingsUpdate,
        ...rest
    } = useContactFormsAutomationSettings(contactFormIds)

    const handleContactFormAutomationSettingsUpdateOverride = useCallback(
        (
            automationSettings: Parameters<
                typeof handleContactFormAutomationSettingsUpdate
            >[1],
            notificationMessage?: string
        ) =>
            notificationMessage
                ? handleContactFormAutomationSettingsUpdate(
                      contactFormId,
                      automationSettings,
                      notificationMessage
                  )
                : handleContactFormAutomationSettingsUpdate(
                      contactFormId,
                      automationSettings
                  ),
        [contactFormId, handleContactFormAutomationSettingsUpdate]
    )
    const automationSettings =
        contactFormsAutomationSettings[contactFormId.toString()] ??
        CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS

    return {
        ...rest,
        handleContactFormAutomationSettingsUpdate:
            handleContactFormAutomationSettingsUpdateOverride,
        automationSettings,
    }
}

export default useContactFormAutomationSettings
