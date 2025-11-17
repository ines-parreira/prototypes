import type { ReactNode } from 'react'
import React, { useState } from 'react'

import classnames from 'classnames'

import orderIcon from 'assets/img/icons/order-icon.svg'

import css from './MetafieldsContainer.less'

type Props = {
    children: ReactNode
    title: string
    onOpened?: () => void
}

export default function MetafieldsContainer({
    children,
    title,
    onOpened,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const onClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            onOpened?.()
        }
    }
    return (
        <div className={css.container}>
            <div className={css.header}>
                <img alt={'Metafields'} src={orderIcon} className={css.icon} />
                <span className={css.title}>{title}</span>
                <span
                    className={classnames(css.dropdownIcon, 'clickable')}
                    onClick={onClick}
                    title={isOpen ? 'Fold this card' : 'Unfold this card'}
                >
                    {isOpen ? (
                        <i className={`material-icons ${css.toggle}`}>
                            expand_less
                        </i>
                    ) : (
                        <i className={`material-icons ${css.toggle}`}>
                            expand_more
                        </i>
                    )}
                </span>
            </div>
            <div className={css.content}>{isOpen && children}</div>
        </div>
    )
}
