import { useMemo } from 'react'

import { useAllUsers } from '@repo/users'

import { Text } from '@gorgias/axiom'

type TicketThreadEventAuthorProps = {
    authorId: number
}

export function TicketThreadEventAuthor({
    authorId,
}: TicketThreadEventAuthorProps) {
    const agents = useAllUsers()
    const eventAuthor = useMemo(
        () => agents.find((agent) => agent.id === authorId),
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
