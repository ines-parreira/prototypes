import type { TicketThreadAuditLogEventItem } from '../../../../hooks/events/types'
import { assertNever } from '../../../../utils/assertNever'
import { TicketThreadAuditLogCustomerUpdatedEvent } from './components/TicketThreadAuditLogCustomerUpdatedEvent'
import { TicketThreadAuditLogRuleExecutedEvent } from './components/TicketThreadAuditLogRuleExecutedEvent/TicketThreadAuditLogRuleExecutedEvent'
import { TicketThreadAuditLogRuleSuggestionEvent } from './components/TicketThreadAuditLogRuleSuggestionEvent'
import { TicketThreadAuditLogSatisfactionSurveySentEvent } from './components/TicketThreadAuditLogSatisfactionSurveySentEvent'
import { TicketThreadAuditLogTagsAddedEvent } from './components/TicketThreadAuditLogTagsAddedEvent'
import { TicketThreadAuditLogTagsRemovedEvent } from './components/TicketThreadAuditLogTagsRemovedEvent'
import { TicketThreadAuditLogTicketAssignedEvent } from './components/TicketThreadAuditLogTicketAssignedEvent'
import { TicketThreadAuditLogTicketClosedEvent } from './components/TicketThreadAuditLogTicketClosedEvent'
import { TicketThreadAuditLogTicketCreatedEvent } from './components/TicketThreadAuditLogTicketCreatedEvent'
import { TicketThreadAuditLogTicketExcludedFromAutoMergeEvent } from './components/TicketThreadAuditLogTicketExcludedFromAutoMergeEvent'
import { TicketThreadAuditLogTicketExcludedFromCSATEvent } from './components/TicketThreadAuditLogTicketExcludedFromCSATEvent'
import { TicketThreadAuditLogTicketMarkedSpamEvent } from './components/TicketThreadAuditLogTicketMarkedSpamEvent'
import { TicketThreadAuditLogTicketMergedEvent } from './components/TicketThreadAuditLogTicketMergedEvent'
import { TicketThreadAuditLogTicketMessageSummaryCreatedEvent } from './components/TicketThreadAuditLogTicketMessageSummaryCreatedEvent'
import { TicketThreadAuditLogTicketReopenedEvent } from './components/TicketThreadAuditLogTicketReopenedEvent'
import { TicketThreadAuditLogTicketSatisfactionSurveySkippedDetails } from './components/TicketThreadAuditLogTicketSatisfactionSurveySkippedDetails'
import { TicketThreadAuditLogTicketSatisfactionSurveySkippedEvent } from './components/TicketThreadAuditLogTicketSatisfactionSurveySkippedEvent'
import { TicketThreadAuditLogTicketSelfUnsnoozedEvent } from './components/TicketThreadAuditLogTicketSelfUnsnoozedEvent'
import { TicketThreadAuditLogTicketSnoozedEvent } from './components/TicketThreadAuditLogTicketSnoozedEvent'
import { TicketThreadAuditLogTicketSplitEvent } from './components/TicketThreadAuditLogTicketSplitEvent'
import { TicketThreadAuditLogTicketSubjectUpdatedEvent } from './components/TicketThreadAuditLogTicketSubjectUpdatedEvent'
import { TicketThreadAuditLogTicketTeamAssignedEvent } from './components/TicketThreadAuditLogTicketTeamAssignedEvent'
import { TicketThreadAuditLogTicketTeamUnassignedEvent } from './components/TicketThreadAuditLogTicketTeamUnassignedEvent'
import { TicketThreadAuditLogTicketTrashedEvent } from './components/TicketThreadAuditLogTicketTrashedEvent'
import { TicketThreadAuditLogTicketUnassignedEvent } from './components/TicketThreadAuditLogTicketUnassignedEvent'
import { TicketThreadAuditLogTicketUnmarkedSpamEvent } from './components/TicketThreadAuditLogTicketUnmarkedSpamEvent'
import { TicketThreadAuditLogTicketUntrashedEvent } from './components/TicketThreadAuditLogTicketUntrashedEvent'

type TicketThreadAuditLogEventItemProps = {
    item: TicketThreadAuditLogEventItem
}

export function TicketThreadAuditLogEventItem({
    item,
}: TicketThreadAuditLogEventItemProps) {
    switch (item.type) {
        case 'rule-executed':
            if (item.data.data?.slug) {
                return <TicketThreadAuditLogRuleSuggestionEvent item={item} />
            }
            return <TicketThreadAuditLogRuleExecutedEvent item={item} />
        case 'rule-suggestion-suggested':
            return <TicketThreadAuditLogRuleSuggestionEvent item={item} />
        case 'ticket-assigned':
            return <TicketThreadAuditLogTicketAssignedEvent item={item} />
        case 'ticket-closed':
            return <TicketThreadAuditLogTicketClosedEvent item={item} />
        case 'ticket-created':
            return <TicketThreadAuditLogTicketCreatedEvent item={item} />
        case 'ticket-split':
            return <TicketThreadAuditLogTicketSplitEvent item={item} />
        case 'ticket-customer-updated':
            return <TicketThreadAuditLogCustomerUpdatedEvent item={item} />
        case 'ticket-excluded-from-auto-merge':
            return (
                <TicketThreadAuditLogTicketExcludedFromAutoMergeEvent
                    item={item}
                />
            )
        case 'ticket-excluded-from-csat':
            return (
                <TicketThreadAuditLogTicketExcludedFromCSATEvent item={item} />
            )
        case 'ticket-marked-spam':
            return <TicketThreadAuditLogTicketMarkedSpamEvent item={item} />
        case 'ticket-merged':
            return <TicketThreadAuditLogTicketMergedEvent item={item} />
        case 'ticket-message-summary-created':
            return (
                <TicketThreadAuditLogTicketMessageSummaryCreatedEvent
                    item={item}
                />
            )
        case 'ticket-reopened':
            return <TicketThreadAuditLogTicketReopenedEvent item={item} />
        case 'ticket-satisfaction-survey-skipped':
            return (
                <>
                    <TicketThreadAuditLogTicketSatisfactionSurveySkippedEvent
                        item={item}
                    />
                    <TicketThreadAuditLogTicketSatisfactionSurveySkippedDetails
                        item={item}
                    />
                </>
            )
        case 'ticket-self-unsnoozed':
            return <TicketThreadAuditLogTicketSelfUnsnoozedEvent item={item} />
        case 'ticket-snoozed':
            return <TicketThreadAuditLogTicketSnoozedEvent item={item} />
        case 'ticket-subject-updated':
            return <TicketThreadAuditLogTicketSubjectUpdatedEvent item={item} />
        case 'ticket-tags-added':
            return <TicketThreadAuditLogTagsAddedEvent item={item} />
        case 'ticket-tags-removed':
            return <TicketThreadAuditLogTagsRemovedEvent item={item} />
        case 'ticket-team-assigned':
            return <TicketThreadAuditLogTicketTeamAssignedEvent item={item} />
        case 'ticket-team-unassigned':
            return <TicketThreadAuditLogTicketTeamUnassignedEvent item={item} />
        case 'ticket-trashed':
            return <TicketThreadAuditLogTicketTrashedEvent item={item} />
        case 'ticket-unassigned':
            return <TicketThreadAuditLogTicketUnassignedEvent item={item} />
        case 'ticket-unmarked-spam':
            return <TicketThreadAuditLogTicketUnmarkedSpamEvent item={item} />
        case 'ticket-untrashed':
            return <TicketThreadAuditLogTicketUntrashedEvent item={item} />
        case 'satisfaction-survey-sent':
            return (
                <TicketThreadAuditLogSatisfactionSurveySentEvent item={item} />
            )
        default:
            return assertNever(item)
    }
}
