import { useMemo } from 'react'

import { Text } from '@gorgias/axiom'

import { useListAllHumanAgents } from '../../../hooks/shared/useListAllHumanAgents'

type TicketThreadEventAuthorProps = {
    authorId: number
}

export function TicketThreadEventAuthor({
    authorId,
}: TicketThreadEventAuthorProps) {
    const { data: agents } = useListAllHumanAgents()
    const eventAuthor = useMemo(
        () => agents?.find((agent) => agent.id === authorId),
        [agents, authorId],
    )
    if (!eventAuthor) {
        return null
    }
    return (
        <Text size="sm">
            by{' '}
            <Text size="sm" variant="medium">
                {eventAuthor.name}
            </Text>
        </Text>
    )
}
