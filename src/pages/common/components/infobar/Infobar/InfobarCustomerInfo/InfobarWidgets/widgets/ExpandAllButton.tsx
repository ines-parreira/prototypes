import React, {useCallback, useRef, useState} from 'react'
import classnames from 'classnames'

import logo from '../../../../../../../../../img/infobar/expand-all.svg'

import css from './ExpandAllButton.less'

export default function ExpandAllButton() {
    const buttonRef = useRef<HTMLElement>(null)
    const [shouldClose, setShouldClose] = useState(true)

    const onClick = useCallback(() => {
        const container = buttonRef.current?.closest('.infobar-wrapper')
        if (!container) {
            return
        }
        const cards = shouldClose
            ? container.querySelectorAll('.card:not(.transparent):not(.closed)')
            : container.querySelectorAll('.card:not(.transparent).closed')

        cards.forEach((card: Element) => {
            ;(card.querySelector(
                '.dropdown-icon'
            ) as HTMLButtonElement)?.click()
        })

        setShouldClose(!shouldClose)
    }, [shouldClose])

    return (
        <span
            ref={buttonRef}
            className={classnames(css.container, 'expand-all')}
            onClick={onClick}
        >
            <img src={logo} alt="Expand all" />
        </span>
    )
}
