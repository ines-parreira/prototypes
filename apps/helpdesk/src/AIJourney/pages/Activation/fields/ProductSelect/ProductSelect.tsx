import { useCallback } from 'react'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { FieldPresentation, ProductDropdown } from 'AIJourney/components'
import { Product } from 'constants/integrations/types/shopify'

import css from './ProductSelect.less'

type ProductSelectProps = {
    options: Product[]
    value?: string
    onChange?: (option: Product) => void
}

export const ProductSelectField = ({
    options,
    onChange,
}: ProductSelectProps) => {
    const { data: currentUser } = useGetCurrentUser()
    const customerName = currentUser?.data?.name || 'John Doe'

    const handleChange = useCallback(
        (option: Product) => {
            return onChange?.(option)
        },
        [onChange],
    )

    return (
        <div className={css.productSelectField}>
            <FieldPresentation
                name="Customer scenario"
                description={`Customer ${customerName} has left their cart with the following product`}
            />
            <ProductDropdown options={options} onChange={handleChange} />
        </div>
    )
}
