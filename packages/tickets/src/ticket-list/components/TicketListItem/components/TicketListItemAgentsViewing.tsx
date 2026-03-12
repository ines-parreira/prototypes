import {
    Avatar,
    AvatarGroup,
    Box,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import type { Agent } from '../hooks/useTicketListItemData'

type Props = {
    agents: Agent[]
}

export function TicketListItemAgentsViewing({ agents }: Props) {
    if (agents.length === 0) return null

    return (
        <Box flexShrink={0}>
            <Tooltip
                trigger={
                    <div>
                        <AvatarGroup max={3}>
                            {agents.map((agent) => (
                                <Avatar
                                    key={agent.id}
                                    name={agent.name ?? agent.email ?? ''}
                                    size="sm"
                                />
                            ))}
                        </AvatarGroup>
                    </div>
                }
            >
                <TooltipContent>
                    {agents.length === 1 ? (
                        `${agents[0].name ?? agents[0].email} is viewing`
                    ) : (
                        <Box flexDirection="column" gap="xxxs">
                            <Text size="sm">Multiple agents are viewing</Text>
                            {agents.map((agent) => (
                                <Text key={agent.id} size="sm">
                                    {agent.name ?? agent.email}
                                </Text>
                            ))}
                        </Box>
                    )}
                </TooltipContent>
            </Tooltip>
        </Box>
    )
}
