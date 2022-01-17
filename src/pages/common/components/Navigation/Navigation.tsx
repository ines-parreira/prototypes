import React from 'react'
import {Button, ButtonGroup} from 'reactstrap'

type Props = {
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
}

export default function Navigation({
    hasNextItems,
    fetchNextItems,
    hasPrevItems,
    fetchPrevItems,
}: Props) {
    if (!hasPrevItems && !hasNextItems) {
        return null
    }

    return (
        <ButtonGroup>
            <Button
                id="prev-btn"
                color="secondary"
                disabled={!hasPrevItems}
                onClick={fetchPrevItems}
            >
                <i className="material-icons md-2">keyboard_arrow_left</i>
            </Button>
            <Button
                id="next-btn"
                color="secondary"
                disabled={!hasNextItems}
                onClick={fetchNextItems}
            >
                <i className="material-icons md-2">keyboard_arrow_right</i>
            </Button>
        </ButtonGroup>
    )
}
