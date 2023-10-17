import {GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH} from 'config/integrations/gorgias_chat'

export type FilterProps = {
    emailCaptureEnforcement?: string
}
export type OptionFormat = {
    maxLength: number
    filteredBy?: (props: FilterProps) => boolean
}

export default {
    // TODO. Drop me with the feature flag `ChatMultiLanguages`.
    generalLegacySoloLanguage: {
        'sspTexts.sendUsAMessage': {maxLength: 30},
        'texts.leaveAMessage': {maxLength: 30},
        'sspTexts.needHelp': {maxLength: 30},
        'texts.backLabelBackAt': {
            maxLength: 35,
        },
    },
    general: {
        'texts.chatTitle': {maxLength: 100},
        'texts.chatWithUs': {maxLength: 30},
        'sspTexts.sendUsAMessage': {maxLength: 30},
        'texts.leaveAMessage': {maxLength: 30},
        'sspTexts.needHelp': {maxLength: 30},
        'texts.backLabelBackAt': {
            maxLength: 35,
        },
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
        'texts.contactFormIntro': {maxLength: 110},
        'texts.contactFormAskSubject': {maxLength: 35},
        'sspTexts.trackOrderShort': {maxLength: 20},
        'sspTexts.reportIssueShort': {maxLength: 25},
        'sspTexts.cancelOrderShort': {maxLength: 25},
        'texts.productQuestionShort': {maxLength: 25},
        'texts.contactFormAskSubjectOther': {
            maxLength: 35,
        },
        'texts.contactFormAskMessage': {maxLength: 125},
        'texts.contactFormAskEmail': {maxLength: 50},
        'texts.contactFormAskAdditionalMessage': {
            maxLength: 70,
        },
        'texts.thatsAll': {maxLength: 15},
        'texts.contactFormEndingMessage': {
            maxLength: 85,
        },
    },
    contactFormConfirmationEmail: {
        'meta.contactFormEmailIntro': {maxLength: 20},
        'meta.contactFormEmailMessage': {maxLength: 200},
        'meta.contactFormEmailOutro': {maxLength: 25},
    },
    dynamicWaitTime: {
        'texts.waitTimeShortNoEmail': {maxLength: 170},
        'texts.waitTimeShortEmailCaptured': {
            maxLength: 110,
        },
        'texts.waitTimeMediumNoEmail': {maxLength: 195},
        'texts.waitTimeMediumEmailCaptured': {
            maxLength: 140,
        },
        'texts.waitTimeAgentsAreBusy': {maxLength: 155},
        'texts.waitForAnAgent': {maxLength: 30},
        'texts.waitTimeLongEmailCaptured': {
            maxLength: 110,
        },
        'texts.waitTimeLongNoEmail': {maxLength: 165},
        'texts.getRepliesByEmail': {
            maxLength: 45,
        },
    },
    autoResponder: {
        'texts.usualReplyTimeMinutes': {maxLength: 50},
        'texts.usualReplyTimeHours': {maxLength: 50},
        'texts.emailCaptureTriggerTextBase': {
            maxLength: 80,
        },
        'texts.thanksForReachingOut': {
            maxLength: 45,
        },
        'texts.emailCaptureTriggerTypicalReplyMinutes': {maxLength: 65},
        'texts.emailCaptureTriggerTypicalReplyHours': {maxLength: 65},
    },
    emailCapture: {
        'texts.emailCaptureOnlineTriggerText': {
            maxLength: 80,
            filteredBy: ({emailCaptureEnforcement}: FilterProps) => {
                if (emailCaptureEnforcement === 'always-required') {
                    return false
                }
                return true
            },
        },
        'sspTexts.youWillGetRepliesHereAndByEmail': {
            maxLength: 60,
        },
        'texts.emailCaptureThanksText': {
            maxLength: 120,
        },
        'texts.requireEmailCaptureIntro': {
            maxLength: 145,
            filteredBy: ({emailCaptureEnforcement}: FilterProps) => {
                if (emailCaptureEnforcement !== 'always-required') {
                    return false
                }
                return true
            },
        },
        'texts.howCanWeHelpToday': {maxLength: 45},
    },
}
