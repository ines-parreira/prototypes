import { Link } from 'react-router-dom'

import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { SYSTEM_RULE_TYPE } from '../../../../../../hooks/events/constants'
import type { TicketThreadAuditLogEventByType } from '../../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../TicketThreadEventDateTime'
import { getRuleFailedActionsDisplay } from './ruleFailureTransforms'

type TicketThreadAuditLogRuleExecutedEventProps = {
    item: TicketThreadAuditLogEventByType<'rule-executed'>
}

export function TicketThreadAuditLogRuleExecutedEvent({
    item,
}: TicketThreadAuditLogRuleExecutedEventProps) {
    const event = item.data

    if (event.data?.type === SYSTEM_RULE_TYPE) {
        return null
    }

    const ruleId = event.data?.id
    const ruleName = event.data?.name ?? event.data?.id?.toString()
    const triggeringEventType = event.data?.triggering_event_type

    const failedActions = getRuleFailedActionsDisplay(
        event.data?.failed_actions,
    )

    return (
        <TicketThreadEventContainer>
            <Icon name="wrench" />
            {ruleName ? (
                <Text size="sm">
                    Rule{' '}
                    {ruleId ? (
                        <Link to={`/app/settings/rules/${ruleId}`}>
                            {ruleName}
                        </Link>
                    ) : (
                        ruleName
                    )}
                    {` `}executed
                </Text>
            ) : (
                <Text size="sm">Rule executed</Text>
            )}
            {triggeringEventType && (
                <Text size="sm">on {`"${triggeringEventType}"`}</Text>
            )}
            {failedActions.length > 0 && (
                <Tooltip
                    trigger={
                        <Icon
                            name="triangle-warning"
                            color={
                                failedActions[0].failureSeverity === 'warning'
                                    ? 'yellow'
                                    : 'red'
                            }
                        />
                    }
                >
                    <TooltipContent>
                        {failedActions.map((action) => (
                            <Box
                                key={`${action.actionName}-${action.failureDescription}`}
                                flexDirection="column"
                                gap="xxs"
                            >
                                <Text size="sm" variant="medium">
                                    {action.actionName} failed:
                                </Text>
                                <Text size="sm">
                                    {action.failureDescription}
                                </Text>
                            </Box>
                        ))}
                    </TooltipContent>
                </Tooltip>
            )}
            <TicketThreadAuditLogEventAttribution
                attribution={item.meta.attribution}
                authorId={event.user_id}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
