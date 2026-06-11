import type { ComponentProps, ForwardedRef } from 'react'
import React, { forwardRef } from 'react'

import { Caption } from 'pages/common/forms/Caption/Caption'
import { DefaultExportNumberInput as NumberInput } from 'pages/common/forms/input/NumberInput'

type NumberInputFieldProps = ComponentProps<typeof NumberInput> & {
    error?: string
    wrapperClassName?: string
}

const DefaultExportNumberInputField = forwardRef(function NumberInputField(
    { error, wrapperClassName, ...numberInputProps }: NumberInputFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
) {
    return (
        <div className={wrapperClassName}>
            <NumberInput {...numberInputProps} ref={ref} hasError={!!error} />
            {!!error && <Caption error={error} />}
        </div>
    )
})

export { DefaultExportNumberInputField }
