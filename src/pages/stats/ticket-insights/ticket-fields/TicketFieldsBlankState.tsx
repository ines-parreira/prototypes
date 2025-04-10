import {
    TicketInsightsBlankState,
    TicketInsightsBlankStateCallToAction,
    TicketInsightsBlankStateImage,
    TicketInsightsBlankStateText,
    TicketInsightsBlankStateTitle,
} from 'pages/stats/ticket-insights/components/TicketInsightsBlankState'

export const BLANK_STATE_TITLE = 'Nothing to report on'
export const BLANK_STATE_TEXT =
    "You don't have any active dropdown ticket fields. Create your first dropdown ticket field to start getting insights."
export const BLANK_STATE_CALL_TO_ACTION = 'Manage Ticket Fields'

export function TicketFieldsBlankState() {
    return (
        <TicketInsightsBlankState>
            <TicketInsightsBlankStateImage />
            <TicketInsightsBlankStateTitle>
                {BLANK_STATE_TITLE}
            </TicketInsightsBlankStateTitle>
            <TicketInsightsBlankStateText>
                {BLANK_STATE_TEXT}
            </TicketInsightsBlankStateText>
            <TicketInsightsBlankStateCallToAction href="/app/settings/ticket-fields/active">
                {BLANK_STATE_CALL_TO_ACTION}
            </TicketInsightsBlankStateCallToAction>
        </TicketInsightsBlankState>
    )
}
