import React, {ReactNode, useState} from 'react'
import classnames from 'classnames'

import css from './Foldable.less'

type Props = {
    children: ReactNode
    label: ReactNode
}

export default function Foldable({children, label}: Props) {
    const [isOpen, setOpen] = useState(true)

    return (
        <div className={classnames(css.container, {[css.closed]: !isOpen})}>
            <div
                className={classnames(css['icon-wrapper'], {
                    [css.closed]: !isOpen,
                })}
                onClick={() => setOpen(!isOpen)}
            >
                <i className="material-icons">
                    {isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                </i>
            </div>
            {label}
            {isOpen ? (
                <div>{children}</div>
            ) : (
                <div
                    className={css['dots-wrapper']}
                    onClick={() => setOpen(!isOpen)}
                >
                    {/* black circle characters */}
                    &bull;&bull;&bull;
                </div>
            )}
        </div>
    )
}
