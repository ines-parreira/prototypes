import { Text } from '@gorgias/axiom'

import type { ActionExecutedDetailsEntry } from './transforms/types'

type EntryRowProps = {
    entry: ActionExecutedDetailsEntry
}

export function EntryRow({ entry }: EntryRowProps) {
    return (
        <>
            {entry.key && (
                <Text size="sm" variant="medium">
                    {entry.key}:{' '}
                </Text>
            )}
            <Text size="sm">{entry.value}</Text>
        </>
    )
}
