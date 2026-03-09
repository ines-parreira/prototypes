import { useMemo } from 'react'

import { useListAllHumanAgents } from '@repo/users'

import { Text } from '@gorgias/axiom'

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
