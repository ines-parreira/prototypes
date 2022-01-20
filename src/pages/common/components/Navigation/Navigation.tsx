import React from 'react'
import {ButtonGroup} from 'reactstrap'

import {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import css from './Navigation.less'

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
        <ButtonGroup className={className}>
            <IconButton
                className={css.previousButton}
                id="prev-btn"
                intent={ButtonIntent.Secondary}
                isDisabled={!hasPrevItems}
                onClick={fetchPrevItems}
            >
                keyboard_arrow_left
            </IconButton>
            <IconButton
                className={css.nextButton}
                id="next-btn"
                intent={ButtonIntent.Secondary}
                isDisabled={!hasNextItems}
                onClick={fetchNextItems}
            >
                keyboard_arrow_right
            </IconButton>
        </ButtonGroup>
    )
}
