import React, {ComponentProps, ForwardedRef, forwardRef} from 'react'

import NumberInput from 'pages/common/forms/input/NumberInput'
import Caption from 'pages/common/forms/Caption/Caption'

type NumberInputFieldProps = ComponentProps<typeof NumberInput> & {
    error?: string
    wrapperClassName?: string
}

export default forwardRef(function NumberInputField(
    {error, wrapperClassName, ...numberInputProps}: NumberInputFieldProps,
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <div className={wrapperClassName}>
            <NumberInput {...numberInputProps} ref={ref} hasError={!!error} />
            {!!error && <Caption error={error} />}
        </div>
    )
})
