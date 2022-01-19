import classNames from 'classnames'
import React, {ReactChild, MouseEvent} from 'react'

import RadioButton from '../RadioButton'

import css from './PreviewRadioButton.less'

type Props = {
    className?: string
    id?: string
    isSelected?: boolean
    preview?: ReactChild
    value?: string
    label: string
    onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

export const PreviewRadioButton = ({
    className,
    id,
    isSelected = false,
    label,
    preview,
    value,
    onClick,
}: Props) => (
    <div
        className={classNames(
            css.wrapper,
            {
                [css.selected]: isSelected,
            },
            className
        )}
        id={id}
        onClick={onClick}
    >
        {preview && <div className={css.preview}>{preview}</div>}
        <RadioButton value={value} label={label} isSelected={isSelected} />
    </div>
)
