import React, {useCallback, useContext, useRef, useState} from 'react'
import classnames from 'classnames'

import {EditionContext} from 'providers/infobar/EditionContext'

import cssWrapper from './Wrapper.less'
import cssCard from './Card.less'
import css from './ExpandAllButton.less'

export default function ExpandAllButton() {
    const {isEditing} = useContext(EditionContext)
    const buttonRef = useRef<HTMLElement>(null)
    const [shouldClose, setShouldClose] = useState(true)

    const onClick = useCallback(() => {
        const container = buttonRef.current?.closest(
            `.${cssWrapper.widgetWrapper}`
        )
        if (!container) {
            return
        }
        const cards = shouldClose
            ? container.querySelectorAll(
                  `.${cssCard.widgetCard}:not(.transparent):not(.${cssCard.closed})`
              )
            : container.querySelectorAll(
                  `.${cssCard.widgetCard}:not(.transparent).${cssCard.closed}`
              )

        cards.forEach((card: Element) => {
            ;(
                card.querySelector(
                    `.${cssCard.dropdownIcon}`
                ) as HTMLButtonElement
            )?.click()
        })

        setShouldClose(!shouldClose)
    }, [shouldClose])

    if (isEditing) return null

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
