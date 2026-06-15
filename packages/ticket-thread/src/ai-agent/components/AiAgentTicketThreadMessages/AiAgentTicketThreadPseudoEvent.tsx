import type { ColorValue, IconName } from '@gorgias/axiom'
import { Box, Dot, Icon, Tag, Text } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '../../../events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import type { TicketThreadAiAgentPseudoEvent } from '../../types'
import { TicketThreadAiAgentPseudoEventAction } from '../../types'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

const ACTION_LABELS: Record<
    NonNullable<TicketThreadAiAgentPseudoEvent['action']>,
    string
> = {
    [TicketThreadAiAgentPseudoEventAction.Close]: 'Closed',
    [TicketThreadAiAgentPseudoEventAction.Handover]: 'Handed over',
    [TicketThreadAiAgentPseudoEventAction.Snooze]: 'Snoozed',
}

const ACTION_ICONS: Record<
    NonNullable<TicketThreadAiAgentPseudoEvent['action']>,
    IconName
> = {
    [TicketThreadAiAgentPseudoEventAction.Close]: 'check-circle',
    [TicketThreadAiAgentPseudoEventAction.Handover]: 'user-arrow',
    [TicketThreadAiAgentPseudoEventAction.Snooze]: 'timer-snooze',
}

type ByAiAgentProps = {
    agentName?: string
}

function ByAiAgent({ agentName }: ByAiAgentProps) {
    const displayName = getAiAgentDisplayName(agentName)

    return (
        <Box alignItems="center" gap="xxxs">
            <Text size="sm">by</Text>
            <Icon name="ai-alt-1" size="sm" />
            <Text size="sm" variant="medium">
                {displayName}
            </Text>
        </Box>
    )
}

type PseudoEventTagProps = {
    tag: TicketThreadAiAgentPseudoEvent['tags'][number]
}

function PseudoEventTag({ tag }: PseudoEventTagProps) {
    return (
        <Tag
            size="sm"
            {...(tag.decoration?.color && {
                leadingSlot: <Dot color={tag.decoration.color as ColorValue} />,
            })}
        >
            {tag.name}
        </Tag>
    )
}

type AiAgentTicketThreadPseudoEventProps = {
    agentName?: string
    pseudoEvent?: TicketThreadAiAgentPseudoEvent
}

export function AiAgentTicketThreadPseudoEvent({
    agentName,
    pseudoEvent,
}: AiAgentTicketThreadPseudoEventProps) {
    /* v8 ignore next -- defensive fallback for unexpected renderer input */
    if (!pseudoEvent || (!pseudoEvent.action && !pseudoEvent.tags.length)) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xxs" pt="xxs">
            {pseudoEvent.tags.length > 0 && (
                <TicketThreadEventContainer>
                    <Icon name="tag" />
                    <Text size="sm">Tagged</Text>
                    {pseudoEvent.tags.map((tag) => (
                        <PseudoEventTag
                            key={tag.id ?? tag.name ?? 'pseudo-event-tag'}
                            tag={tag}
                        />
                    ))}
                    <ByAiAgent agentName={agentName} />
                </TicketThreadEventContainer>
            )}
            {pseudoEvent.action && (
                <TicketThreadEventContainer>
                    <Icon name={ACTION_ICONS[pseudoEvent.action]} />
                    <Text size="sm">{ACTION_LABELS[pseudoEvent.action]}</Text>
                    <ByAiAgent agentName={agentName} />
                </TicketThreadEventContainer>
            )}
        </Box>
    )
}
