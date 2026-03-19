import { useMemo } from 'react'

import { GorgiasChatLauncherType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types'

import type {
    FilterProps,
    OptionFormat,
} from '../utils/translations-available-keys'
import { translationsAvailableKeys } from '../utils/translations-available-keys'

export type SectionConfig = {
    title: string
    keys: string[]
    formPropsValues: Record<string, OptionFormat>
    requiredKeys?: string[]
}

type Props = {
    isAutomateSubscriber: boolean
    emailCaptureEnforcement: string | undefined
    isDefaultLanguageLoaded: boolean
    integrationChat: GorgiasChatIntegration
}

const filterKeys = (
    formPropsValues: Record<string, OptionFormat>,
    filterProps: FilterProps,
) =>
    Object.keys(formPropsValues).filter((key) => {
        const option = formPropsValues[key]
        return !option.filteredBy || option.filteredBy(filterProps)
    })

export const useTranslateSections = ({
    isAutomateSubscriber,
    emailCaptureEnforcement,
    isDefaultLanguageLoaded,
    integrationChat,
}: Props): SectionConfig[] => {
    return useMemo(() => {
        const generalRequiredKeys = isDefaultLanguageLoaded
            ? integrationChat.decoration.launcher?.type ===
              GorgiasChatLauncherType.ICON_AND_LABEL
                ? ['texts.chatTitle', 'texts.chatWithUs']
                : ['texts.chatTitle']
            : []

        const introRequiredKeys = isDefaultLanguageLoaded
            ? ['texts.introductionText', 'texts.offlineIntroductionText']
            : []

        const privacyPolicyRequiredKeys =
            isDefaultLanguageLoaded &&
            integrationChat.meta.preferences?.privacy_policy_disclaimer_enabled
                ? ['texts.privacyPolicyDisclaimer']
                : []

        const sections: SectionConfig[] = [
            {
                title: 'General',
                keys: Object.keys(translationsAvailableKeys.general),
                formPropsValues: translationsAvailableKeys.general,
                requiredKeys: generalRequiredKeys,
            },
            {
                title: 'Intro message',
                keys: Object.keys(translationsAvailableKeys.intro),
                formPropsValues: translationsAvailableKeys.intro,
                requiredKeys: introRequiredKeys,
            },
            {
                title: 'Offline Capture',
                keys: Object.keys(translationsAvailableKeys.contactForm),
                formPropsValues: translationsAvailableKeys.contactForm,
            },
            {
                title: 'Offline Capture - Confirmation email',
                keys: Object.keys(
                    translationsAvailableKeys.contactFormConfirmationEmail,
                ),
                formPropsValues:
                    translationsAvailableKeys.contactFormConfirmationEmail,
            },
            {
                title: 'Dynamic wait time',
                keys: filterKeys(translationsAvailableKeys.dynamicWaitTime, {
                    isAutomateSubscriber,
                }),
                formPropsValues: translationsAvailableKeys.dynamicWaitTime,
            },
            {
                title: 'Email capture',
                keys: filterKeys(translationsAvailableKeys.emailCapture, {
                    emailCaptureEnforcement,
                    isAutomateSubscriber,
                }),
                formPropsValues: translationsAvailableKeys.emailCapture,
            },
            {
                title: 'Auto-reply with wait time',
                keys: filterKeys(translationsAvailableKeys.autoResponder, {
                    isAutomateSubscriber,
                }),
                formPropsValues: translationsAvailableKeys.autoResponder,
            },
            {
                title: 'Privacy policy disclaimer',
                keys: filterKeys(
                    translationsAvailableKeys.privacyPolicyDisclaimer,
                    {
                        privacyPolicyDisclaimerEnabled:
                            integrationChat.meta.preferences
                                ?.privacy_policy_disclaimer_enabled,
                    },
                ),
                formPropsValues:
                    translationsAvailableKeys.privacyPolicyDisclaimer,
                requiredKeys: privacyPolicyRequiredKeys,
            },
        ]

        return sections.filter((section) => section.keys.length > 0)
    }, [
        isAutomateSubscriber,
        emailCaptureEnforcement,
        isDefaultLanguageLoaded,
        integrationChat,
    ])
}
