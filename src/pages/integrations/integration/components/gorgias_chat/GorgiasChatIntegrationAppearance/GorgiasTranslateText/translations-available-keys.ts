export type FilterProps = {
    emailCaptureEnforcement?: string
}
export type OptionFormat = {
    maxLength: number
    filteredBy?: (props: FilterProps) => boolean
}

export default {
    general: {
        'sspTexts.sendUsAMessage': {maxLength: 17},
        'texts.leaveAMessage': {maxLength: 15},
        'sspTexts.needHelp': {maxLength: 15},
        'texts.backLabelBackAt': {
            maxLength: 28,
        },
    },
    contactForm: {
        'texts.contactFormIntro': {maxLength: 65},
        'texts.contactFormAskSubject': {maxLength: 31},
        'sspTexts.trackOrderShort': {maxLength: 11},
        'sspTexts.reportIssueShort': {maxLength: 12},
        'sspTexts.cancelOrderShort': {maxLength: 12},
        'texts.productQuestionShort': {maxLength: 16},
        'texts.contactFormAskSubjectOther': {
            maxLength: 29,
        },
        'texts.contactFormAskMessage': {maxLength: 71},
        'texts.contactFormAskEmail': {maxLength: 28},
        'texts.contactFormAskAdditionalMessage': {
            maxLength: 52,
        },
        'texts.thatsAll': {maxLength: 10},
        'texts.contactFormEndingMessage': {
            maxLength: 55,
        },
    },
    dynamicWaitTime: {
        'texts.waitTimeShortNoEmail': {maxLength: 101},
        'texts.waitTimeShortEmailCaptured': {
            maxLength: 72,
        },
        'texts.waitTimeMediumNoEmail': {maxLength: 128},
        'texts.waitTimeMediumEmailCaptured': {
            maxLength: 100,
        },
        'texts.waitTimeAgentsAreBusy': {maxLength: 118},
        'texts.waitForAnAgent': {maxLength: 17},
        'texts.waitTimeLongEmailCaptured': {
            maxLength: 98,
        },
        'texts.waitTimeLongNoEmail': {maxLength: 128},
        'texts.getRepliesByEmail': {
            maxLength: 43,
        },
    },
    autoResponder: {
        'texts.usualReplyTimeMinutes': {maxLength: 34},
        'texts.usualReplyTimeHours': {maxLength: 32},
        'texts.emailCaptureTriggerTextBase': {
            maxLength: 55,
        },
        'texts.emailCaptureTriggerTypicalReplyMinutes': {maxLength: 42},
        'texts.emailCaptureTriggerTypicalReplyHours': {maxLength: 40},
    },
    emailCapture: {
        'texts.emailCaptureOnlineTriggerText': {
            maxLength: 52,
            filteredBy: ({emailCaptureEnforcement}: FilterProps) => {
                if (emailCaptureEnforcement === 'always-required') {
                    return false
                }
                return true
            },
        },
        'sspTexts.youWillGetRepliesHereAndByEmail': {
            maxLength: 54,
        },
        'texts.emailCaptureThanksText': {
            maxLength: 80,
        },
        'texts.requireEmailCaptureIntro': {
            maxLength: 89,
            filteredBy: ({emailCaptureEnforcement}: FilterProps) => {
                if (emailCaptureEnforcement !== 'always-required') {
                    return false
                }
                return true
            },
        },
        'texts.howCanWeHelpToday': {maxLength: 31},
    },
}
