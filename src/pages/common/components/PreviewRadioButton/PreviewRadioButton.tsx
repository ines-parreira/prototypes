import classNames from 'classnames'
import React, {ReactChild, MouseEvent, CSSProperties} from 'react'

import {Input} from 'reactstrap'

import css from './PreviewRadioButton.less'

export type PreviewRadioButtonProps = {
    className?: string
    isSelected?: boolean
    preview: ReactChild
    title: string
    style?: CSSProperties
    onClick: (ev: MouseEvent<HTMLButtonElement>) => void
}

export const PreviewRadioButton = ({
    className,
    preview,
    title,
    isSelected = false,
    style,
    onClick,
}: PreviewRadioButtonProps): JSX.Element => (
    <button
        aria-label={title}
        className={classNames(
            {
                [css.wrapper]: true,
                [css.selected]: isSelected,
            },
            className
        )}
        style={style}
        onClick={onClick}
    >
        <div className={css.preview}>{preview}</div>
        <div className={css.label}>
            <Input readOnly tabIndex={-1} type="radio" checked={isSelected} />
            <span className={css.text}>{title}</span>
        </div>
    </button>
)
