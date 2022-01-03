import classNames from 'classnames'
import React, {ReactChild, MouseEvent} from 'react'

import {Input} from 'reactstrap'

import css from './PreviewRadioButton.less'

type Props = {
    className?: string
    isSelected?: boolean
    preview?: ReactChild
    title: string
    onClick: (ev: MouseEvent<HTMLButtonElement>) => void
}

export const PreviewRadioButton = ({
    className,
    preview,
    title,
    isSelected = false,
    onClick,
}: Props) => (
    <button
        aria-label={title}
        className={classNames(
            {
                [css.wrapper]: true,
                [css.selected]: isSelected,
            },
            className
        )}
        onClick={onClick}
    >
        {preview && <div className={css.preview}>{preview}</div>}
        <div className={css.label}>
            <Input readOnly tabIndex={-1} type="radio" checked={isSelected} />
            <span className={css.text}>{title}</span>
        </div>
    </button>
)
