import { useCallback } from 'react'

import { FieldPresentation, Switch } from 'AIJourney/components'

import css from './EnableDiscount.less'

type EnableDiscountFieldProps = {
    isEnabled?: boolean
    onChange?: () => void
}

export const EnableDiscountField = ({
    isEnabled = false,
    onChange,
}: EnableDiscountFieldProps = {}) => {
    const handleChange = useCallback(() => {
        onChange?.()
    }, [onChange])

    return (
        <div className={css.enableDiscountField}>
            <FieldPresentation
                name="Discount code"
                description="Boost conversion by 50%"
            />
            <Switch isChecked={isEnabled} onChange={handleChange} />
        </div>
    )
}
