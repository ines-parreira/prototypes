import classnames from 'classnames'
import React, {useRef, useState} from 'react'

import {
    EXPAND_CONTAINER_MARKER,
    EXPAND_TARGET_MARKER,
    TARGET_CLOSED_MARKER,
} from 'Widgets/modules/Template/config/template'

import css from './ExpandAllButton.less'

export const FOLD_TITLE = 'Fold all'
export const EXPAND_TITLE = 'Unfold all'

export default function ExpandAllButton() {
    const buttonRef = useRef<HTMLElement>(null)
    const [shouldClose, setShouldClose] = useState(true)

    const onClick = () => {
        const container = buttonRef.current?.closest(
            `[${EXPAND_CONTAINER_MARKER}]`
        )

        if (!container) {
            return
        }

        const targets = shouldClose
            ? container.querySelectorAll<HTMLElement>(
                  `[${EXPAND_TARGET_MARKER}]:not([${TARGET_CLOSED_MARKER}=true])`
              )
            : container.querySelectorAll<HTMLElement>(
                  `[${EXPAND_TARGET_MARKER}][${TARGET_CLOSED_MARKER}=true]`
              )

        targets.forEach((target) => {
            target.click()
        })

        setShouldClose(!shouldClose)
    }

    return (
        <span
            ref={buttonRef}
            className={classnames(css.expandAll)}
            onClick={onClick}
            title={shouldClose ? 'Fold all' : 'Unfold all'}
        >
            <i className="material-icons">
                {shouldClose ? 'unfold_less' : 'unfold_more'}
            </i>
        </span>
    )
}
