import React, {useState} from 'react'
import classNames from 'classnames'

import css from './CollapsibleDetails.less'

type Props = {
    title: JSX.Element
    children: React.ReactNode
    isInitiallyOpen?: boolean
}

export default function CollapsibleDetails({
    title,
    children,
    isInitiallyOpen,
}: Props) {
    const [isOpen, setIsOpen] = useState(!!isInitiallyOpen)

    return (
        <>
            <div
                className={css.header}
                data-testid="collapsible-details-header"
                onClick={() => setIsOpen((isOpen) => !isOpen)}
            >
                <div className={css.title}>{title}</div>
                <i className={classNames('material-icons', css.arrow)}>
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
            </div>
            {isOpen && <div className={css.content}>{children}</div>}
        </>
    )
}
