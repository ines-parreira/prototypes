import React, {Component} from 'react'
import {ButtonGroup} from 'reactstrap'

import {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import css from './Navigation.less'

type Props = {
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
}

export default class Navigation extends Component<Props> {
    render() {
        const {hasNextItems, fetchNextItems, hasPrevItems, fetchPrevItems} =
            this.props

        if (!hasPrevItems && !hasNextItems) {
            return null
        }

        return (
            <div className="pl-4 mb-4">
                <ButtonGroup>
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
            </div>
        )
    }
}
