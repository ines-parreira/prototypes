import React, {ComponentProps, ForwardedRef, forwardRef} from 'react'

import NumberInput from 'pages/common/forms/input/NumberInput'
import Caption from 'pages/common/forms/Caption/Caption'

type NumberInputFieldProps = ComponentProps<typeof NumberInput> & {
    error?: string
}

export default forwardRef(function NumberInputField(
    {error, ...numberInputProps}: NumberInputFieldProps,
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <div>
            <NumberInput {...numberInputProps} ref={ref} hasError={!!error} />
            {!!error && <Caption error={error} />}
        </div>
    )
})
