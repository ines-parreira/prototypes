import { Text } from '@gorgias/axiom'

import { MessageMetaLabel } from './MessageMetaLabel'

type MessageSearchQueryProps = {
    query: string
}

export function MessageSearchQuery({ query }: MessageSearchQueryProps) {
    return (
        <MessageMetaLabel icon="magnifying-glass">
            from search:{' '}
            <Text size="sm" color="content-neutral-secondary" variant="bold">
                {query}
            </Text>
        </MessageMetaLabel>
    )
}
