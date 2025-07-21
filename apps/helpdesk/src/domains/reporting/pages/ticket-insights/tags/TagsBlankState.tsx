import {
    TicketInsightsBlankState,
    TicketInsightsBlankStateCallToAction,
    TicketInsightsBlankStateImage,
    TicketInsightsBlankStateText,
    TicketInsightsBlankStateTitle,
} from 'domains/reporting/pages/ticket-insights/components/TicketInsightsBlankState'

export const BLANK_STATE_TITLE = 'Nothing to report on'
export const BLANK_STATE_TEXT =
    "You don't have any active tags. Create your first tag to start getting insights."
export const BLANK_STATE_CALL_TO_ACTION = 'Manage Tags'

export function TagsBlankState() {
    return (
        <TicketInsightsBlankState>
            <TicketInsightsBlankStateImage />
            <TicketInsightsBlankStateTitle>
                {BLANK_STATE_TITLE}
            </TicketInsightsBlankStateTitle>
            <TicketInsightsBlankStateText>
                {BLANK_STATE_TEXT}
            </TicketInsightsBlankStateText>
            <TicketInsightsBlankStateCallToAction href="/settings/manage-tags">
                {BLANK_STATE_CALL_TO_ACTION}
            </TicketInsightsBlankStateCallToAction>
        </TicketInsightsBlankState>
    )
}
