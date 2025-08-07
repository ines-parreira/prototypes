import { useCallback } from 'react'

import { FieldPresentation, Selector } from 'AIJourney/components'
import css from 'AIJourney/pages/Setup/fields/MessageWithDiscountCode/MessageWithDiscountCode.less'

type MessageWithDiscountCodeFieldProps = {
    numberOfMessages: number
    value?: number
    onChange?: (value: number) => void
}

export const MessageWithDiscountCodeField = ({
    value,
    onChange,
    numberOfMessages,
}: MessageWithDiscountCodeFieldProps) => {
    const options = Array.from({ length: numberOfMessages }, (_, i) => i + 1)

    const handleChange = useCallback(
        (option: number) => {
            return onChange?.(option)
        },
        [onChange],
    )

    return (
        <div className={css.wrapper}>
            <FieldPresentation
                name="Select message that includes discount code"
                description="When should the discount code be introduced by the agent"
            />
            <Selector options={options} value={value} onChange={handleChange} />
        </div>
    )
}
