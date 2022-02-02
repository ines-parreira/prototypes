import classNames from 'classnames'
import React, {ReactChild, MouseEvent} from 'react'

import RadioButton, {RadioButtonProps} from '../RadioButton'

import css from './PreviewRadioButton.less'

type Props = RadioButtonProps & {
    className?: string
    id?: string
    isSelected?: boolean
    preview?: ReactChild
    onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

export const PreviewRadioButton = ({
    className,
    id,
    isDisabled,
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
                [css.disabled]: isDisabled,
            },
            className
        )}
        id={id}
        onClick={(e) => !isDisabled && onClick(e)}
    >
        {preview && <div className={css.preview}>{preview}</div>}
        <RadioButton
            value={value}
            label={label}
            isSelected={isSelected}
            isDisabled={isDisabled}
        />
    </div>
)
