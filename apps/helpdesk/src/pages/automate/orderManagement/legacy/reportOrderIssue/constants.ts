import type {
    ReportIssueCaseReasonAction,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import { AUTOMATED_RESPONSE } from 'models/selfServiceConfiguration/types'

export const SCENARIO_NAME_MAX_LENGTH = 20
export const SCENARIO_DESCRIPTION_MAX_LENGTH = 200
export const SCENARIO_MAX_NUMBER_OF_CONDITIONS_PER_VARIABLE = 2

export const SCENARIO_REASON_DEFAULT_ACTION: ReportIssueCaseReasonAction = {
    type: AUTOMATED_RESPONSE,
    responseMessageContent: {
        html: '',
        text: '',
    },
    showHelpfulPrompt: false,
}
export const DEFAULT_SCENARIO: SelfServiceReportIssueCase = {
    title: '',
    description: '',
    conditions: { and: [] },
    newReasons: [],
}
