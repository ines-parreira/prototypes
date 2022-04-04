import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import Group from 'pages/common/components/layout/Group'

type Props = {
    className?: string
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
}

export default function Navigation({
    className,
    hasNextItems,
    fetchNextItems,
    hasPrevItems,
    fetchPrevItems,
}: Props) {
    if (!hasPrevItems && !hasNextItems) {
        return null
    }

    return (
        <Group className={className}>
            <IconButton
                id="prev-btn"
                intent="secondary"
                isDisabled={!hasPrevItems}
                onClick={fetchPrevItems}
            >
                keyboard_arrow_left
            </IconButton>
            <IconButton
                id="next-btn"
                intent="secondary"
                isDisabled={!hasNextItems}
                onClick={fetchNextItems}
            >
                keyboard_arrow_right
            </IconButton>
        </Group>
    )
}
