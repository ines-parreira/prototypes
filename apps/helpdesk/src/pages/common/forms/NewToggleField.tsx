import type { ComponentProps, ForwardedRef } from 'react'
import type React from 'react'
import { forwardRef } from 'react'

import { NewToggleButton } from './NewToggleButton'

import css from './NewToggleField.less'

type Props = {
    value: boolean
    label?: React.ReactNode
} & Omit<ComponentProps<typeof NewToggleButton>, 'checked'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ToggleField />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
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
