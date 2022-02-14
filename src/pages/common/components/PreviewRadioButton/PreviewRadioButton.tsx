import React, {ComponentProps, ReactChild, MouseEvent} from 'react'
import classNames from 'classnames'

import RadioButton from '../RadioButton'

import css from './PreviewRadioButton.less'

type Props = ComponentProps<typeof RadioButton> & {
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
    name,
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
        role="radio"
        aria-checked={isSelected}
        id={id}
        tabIndex={0}
        aria-label={String(label)}
        onClick={(e) => !isDisabled && onClick(e)}
    >
        {preview && (
            <div className={css.preview} role="img">
                {preview}
            </div>
        )}
        <RadioButton
            value={value}
            label={label}
            isSelected={isSelected}
            isDisabled={isDisabled}
            name={name}
            tabIndex={-1}
        />
    </div>
)
