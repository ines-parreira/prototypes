export type FilterProps = {
    emailCaptureEnforcement?: string
}
export type OptionFormat = {
    maxLength: number
    filteredBy?: (props: FilterProps) => boolean
}

export default {
    general: {
        'sspTexts.sendUsAMessage': {maxLength: 30},
        'texts.leaveAMessage': {maxLength: 27},
        'sspTexts.needHelp': {maxLength: 27},
        'texts.backLabelBackAt': {
            maxLength: 32,
        },
    },
    contactForm: {
        'texts.contactFormIntro': {maxLength: 106},
        'texts.contactFormAskSubject': {maxLength: 33},
        'sspTexts.trackOrderShort': {maxLength: 20},
        'sspTexts.reportIssueShort': {maxLength: 23},
        'sspTexts.cancelOrderShort': {maxLength: 21},
        'texts.productQuestionShort': {maxLength: 23},
        'texts.contactFormAskSubjectOther': {
            maxLength: 32,
        },
        'texts.contactFormAskMessage': {maxLength: 122},
        'texts.contactFormAskEmail': {maxLength: 48},
        'texts.contactFormAskAdditionalMessage': {
            maxLength: 68,
        },
        'texts.thatsAll': {maxLength: 12},
        'texts.contactFormEndingMessage': {
            maxLength: 85,
        },
    },
    dynamicWaitTime: {
        'texts.waitTimeShortNoEmail': {maxLength: 166},
        'texts.waitTimeShortEmailCaptured': {
            maxLength: 109,
        },
        'texts.waitTimeMediumNoEmail': {maxLength: 192},
        'texts.waitTimeMediumEmailCaptured': {
            maxLength: 136,
        },
        'texts.waitTimeAgentsAreBusy': {maxLength: 152},
        'texts.waitForAnAgent': {maxLength: 28},
        'texts.waitTimeLongEmailCaptured': {
            maxLength: 106,
        },
        'texts.waitTimeLongNoEmail': {maxLength: 163},
        'texts.getRepliesByEmail': {
            maxLength: 41,
        },
    },
    autoResponder: {
        'texts.usualReplyTimeMinutes': {maxLength: 50},
        'texts.usualReplyTimeHours': {maxLength: 49},
        'texts.emailCaptureTriggerTextBase': {
            maxLength: 79,
        },
        'texts.emailCaptureTriggerTypicalReplyMinutes': {maxLength: 64},
        'texts.emailCaptureTriggerTypicalReplyHours': {maxLength: 64},
    },
    emailCapture: {
        'texts.emailCaptureOnlineTriggerText': {
            maxLength: 76,
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
            maxLength: 119,
        },
        'texts.requireEmailCaptureIntro': {
            maxLength: 144,
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
