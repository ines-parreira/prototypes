import { omit } from 'lodash'

import {
    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
    GORGIAS_CHAT_NAME_MAX_LENGTH,
} from 'config/integrations/gorgias_chat'
import type { TextsPerLanguage } from 'rest_api/gorgias_chat_protected_api/types'

export type FilterProps = {
    emailCaptureEnforcement?: string
    isAutomateSubscriber?: boolean
    privacyPolicyDisclaimerEnabled?: boolean
}
export type OptionFormat = {
    maxLength: number
    isRichText?: boolean
    filteredBy?: (props: FilterProps) => boolean
}

const keysToDelete = [
    'texts.waitTimeShortNoEmail',
    'texts.waitTimeMediumNoEmail',
    'texts.waitTimeLongNoEmail',
    'texts.emailCaptureOnlineTriggerText',
    'texts.emailCaptureThanksText',
    'texts.howCanWeHelpToday',
    'texts.emailCaptureTriggerTextBase',
    'texts.thanksForReachingOut',
]

export const deleteUnusedKeys = (obj: TextsPerLanguage): TextsPerLanguage => {
    return omit(obj, keysToDelete) as TextsPerLanguage
}

const filterByAutomateSubscriber = ({ isAutomateSubscriber }: FilterProps) => {
    return Boolean(isAutomateSubscriber)
}

const filterByEmailCapture = ({ emailCaptureEnforcement }: FilterProps) => {
    if (emailCaptureEnforcement !== 'always-required') {
        return false
    }
    return true
}

const filterByPrivacyPolicyDisclaimer = ({
    privacyPolicyDisclaimerEnabled,
}: FilterProps) => {
    return Boolean(privacyPolicyDisclaimerEnabled)
}

export const translationsAvailableKeys = {
    general: {
        'texts.chatTitle': { maxLength: GORGIAS_CHAT_NAME_MAX_LENGTH },
        'texts.chatWithUs': { maxLength: 30 },
        'sspTexts.sendUsAMessage': { maxLength: 30 },
        'texts.leaveAMessage': { maxLength: 30 },
        'sspTexts.needHelp': { maxLength: 30 },
        'texts.backLabelBackAt': {
            maxLength: 35,
        },
        'texts.inputInitialPlaceholder': { maxLength: 50 },
    },
    intro: {
        'texts.introductionText': {
            maxLength: GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
        },
        'texts.offlineIntroductionText': {
            maxLength: GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
        },
    },
    contactForm: {
        'texts.contactFormIntro': { maxLength: 110 },
        'texts.contactFormAskSubject': { maxLength: 35 },
        'sspTexts.trackOrderShort': { maxLength: 20 },
        'sspTexts.reportIssueShort': { maxLength: 25 },
        'sspTexts.cancelOrderShort': { maxLength: 25 },
        'texts.productQuestionShort': { maxLength: 25 },
        'texts.contactFormAskSubjectOther': {
            maxLength: 35,
        },
        'texts.contactFormAskMessage': { maxLength: 125 },
        'texts.contactFormAskEmail': { maxLength: 50 },
        'texts.contactFormAskAdditionalMessage': {
            maxLength: 70,
        },
        'texts.thatsAll': { maxLength: 15 },
        'texts.contactFormEndingMessage': {
            maxLength: 85,
        },
    },
    contactFormConfirmationEmail: {
        'meta.contactFormEmailIntro': { maxLength: 20 },
        'meta.contactFormEmailMessage': { maxLength: 200 },
        'meta.contactFormEmailOutro': { maxLength: 25 },
    },
    dynamicWaitTime: {
        'texts.waitTimeShortHeader': { maxLength: 30 },
        'texts.waitTimeMediumHeader': { maxLength: 40 },
        'texts.waitTimeLongHeader': { maxLength: 40 },
        'texts.waitTimeShortEmailCaptured': {
            maxLength: 110,
        },
        'texts.waitTimeMediumEmailCaptured': {
            maxLength: 140,
        },
        'texts.waitTimeAgentsAreBusy': { maxLength: 155 },
        'sspTexts.sorryToHearThatEmailNotRequired': {
            maxLength: 70,
            filteredBy: filterByAutomateSubscriber,
        },
        'texts.waitTimeMediumSorryToHearThat': {
            maxLength: 105,
            filteredBy: filterByAutomateSubscriber,
        },
        'texts.waitTimeAgentsAreBusySorryToHearThat': {
            maxLength: 95,
            filteredBy: filterByAutomateSubscriber,
        },
        'texts.waitForAnAgent': { maxLength: 30 },
        'texts.waitTimeLongEmailCaptured': {
            maxLength: 110,
        },
        'texts.getRepliesByEmail': {
            maxLength: 45,
        },
    },
    autoResponder: {
        'texts.usualReplyTimeMinutes': { maxLength: 50 },
        'texts.usualReplyTimeHours': { maxLength: 50 },
        'texts.emailCaptureTriggerTypicalReplyMinutes': { maxLength: 100 },
        'texts.emailCaptureTriggerTypicalReplyHours': { maxLength: 100 },
        'sspTexts.sorryToHearThatHandoverToLiveChatFewMinutes': {
            maxLength: 85,
            filteredBy: filterByAutomateSubscriber,
        },
        'sspTexts.sorryToHearThatHandoverToLiveChatFewHours': {
            maxLength: 85,
            filteredBy: filterByAutomateSubscriber,
        },
    },
    emailCapture: {
        'texts.emailCaptureInputLabel': { maxLength: 40 },
        'sspTexts.youWillGetRepliesHereAndByEmail': {
            maxLength: 60,
        },
        'texts.requireEmailCaptureIntro': {
            maxLength: 145,
            filteredBy: filterByEmailCapture,
        },
        'sspTexts.sorryToHearThatEmailRequired': {
            maxLength: 65,
            filteredBy: filterByAutomateSubscriber,
        },
        'sspTexts.email': { maxLength: 10 },
    },
    privacyPolicyDisclaimer: {
        'texts.privacyPolicyDisclaimer': {
            maxLength: 600,
            isRichText: true,
            filteredBy: filterByPrivacyPolicyDisclaimer,
        },
    },
}
