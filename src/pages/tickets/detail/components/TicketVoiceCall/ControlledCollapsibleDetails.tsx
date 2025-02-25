import React from 'react'

import classNames from 'classnames'

import css from './CollapsibleDetails.less'

type Props = {
    title: JSX.Element
    children: React.ReactNode
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

export default function ControlledCollapsibleDetails({
    title,
    children,
    isOpen,
    setIsOpen,
}: Props) {
    return (
        <>
            <div className={css.header} onClick={() => setIsOpen(!isOpen)}>
                <div className={css.title}>{title}</div>
                <i className={classNames('material-icons', css.arrow)}>
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </div>
            {isOpen && <div className={css.content}>{children}</div>}
        </>
    )
}
