import React, { ComponentProps, ForwardedRef, forwardRef } from 'react'

import { NewToggleButton } from './NewToggleButton'

import css from './NewToggleField.less'

type Props = {
    value: boolean
    label?: React.ReactNode
} & Omit<ComponentProps<typeof NewToggleButton>, 'checked'>

function NewToggleField(
    { value, label, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>,
) {
    return (
        <div className={css.group}>
            <div>{label}</div>
            <NewToggleButton {...props} ref={ref} checked={value} />
        </div>
    )
}

export default forwardRef(NewToggleField)
