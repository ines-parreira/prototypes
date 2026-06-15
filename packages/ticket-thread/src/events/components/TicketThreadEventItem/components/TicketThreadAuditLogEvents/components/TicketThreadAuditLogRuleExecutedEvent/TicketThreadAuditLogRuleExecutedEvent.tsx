import _truncate from 'lodash/truncate'
import { Link } from 'react-router-dom'

import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { SYSTEM_RULE_TYPE } from '../../../../../../constants'
import type { TicketThreadAuditLogEventByType } from '../../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../TicketThreadEventDateTime'
import { getRuleFailedActionsDisplay } from './ruleFailureTransforms'

import css from './TicketThreadAuditLogRuleExecutedEvent.less'

type TicketThreadAuditLogRuleExecutedEventProps = {
    item: TicketThreadAuditLogEventByType<'rule-executed'>
}

const RULE_PREVIEW_MAX_LENGTH = 500
const RULE_PREVIEW_OMISSION = '... [see the rest of the rule in the settings]'

function getRulePreview(code: string | null | undefined) {
    if (!code?.trim()) {
        return null
    }

    return _truncate(code, {
        length: RULE_PREVIEW_MAX_LENGTH,
        omission: RULE_PREVIEW_OMISSION,
    })
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
    const rulePreview = getRulePreview(event.data?.code)

    const failedActions = getRuleFailedActionsDisplay(
        event.data?.failed_actions,
    )

    const ruleLabel = ruleName ? (
        <Text size="sm">
            Rule{' '}
            {ruleId ? (
                <Link to={`/app/settings/rules/${ruleId}`}>{ruleName}</Link>
            ) : (
                ruleName
            )}
            {` `}executed
        </Text>
    ) : (
        <Text size="sm">Rule executed</Text>
    )

    return (
        <TicketThreadEventContainer>
            <Icon name="wrench" />
            {rulePreview ? (
                <Tooltip placement="top" trigger={<span>{ruleLabel}</span>}>
                    <TooltipContent maxWidth={600}>
                        <Text className={css.rulePreview} size="sm">
                            {rulePreview}
                        </Text>
                    </TooltipContent>
                </Tooltip>
            ) : (
                ruleLabel
            )}
            {triggeringEventType && (
                <Text size="sm">on {`"${triggeringEventType}"`}</Text>
            )}
            {failedActions.length > 0 && (
                <Tooltip
                    trigger={
                        <Icon
                            name="warning-triangle"
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
