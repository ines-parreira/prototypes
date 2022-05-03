import React, {ComponentProps, ReactChild, MouseEvent} from 'react'
import classNames from 'classnames'

import RadioButton from '../RadioButton'

import css from './PreviewRadioButton.less'

type Props = ComponentProps<typeof RadioButton> & {
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
    onClick,
    ...other
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
            {...other}
            label={label}
            isSelected={isSelected}
            isDisabled={isDisabled}
            tabIndex={-1}
        />
    </div>
)
