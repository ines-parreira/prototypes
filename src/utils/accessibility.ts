import { SyntheticEvent } from 'react'

import memoize from 'lodash/memoize'

function _handleButtonLikeClick(
    callback: (evt: SyntheticEvent<HTMLElement>, ...args: unknown[]) => unknown,
) {
    return {
        tabIndex: 0,
        role: 'button',
        onClick: (evt: React.MouseEvent<HTMLElement>) => {
            callback(evt)
        },
        onKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => {
            if (evt.code === 'Enter' || evt.code === 'Space') {
                callback(evt)
            }
        },
    }
}

export const handleButtonLikeClick = memoize(_handleButtonLikeClick)
