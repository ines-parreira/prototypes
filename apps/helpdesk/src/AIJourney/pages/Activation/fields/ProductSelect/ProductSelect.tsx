import { useCallback } from 'react'

import { FieldPresentation, ProductDropdown } from 'AIJourney/components'
import { Product } from 'constants/integrations/types/shopify'

import css from './ProductSelect.less'

type ProductSelectProps = {
    options: Product[]
    name: string
    value?: string
    description?: string
    onChange?: (option: Product) => void
}

export const ProductSelectField = ({
    options,
    name,
    description,
    onChange,
}: ProductSelectProps) => {
    const handleChange = useCallback(
        (option: Product) => {
            return onChange?.(option)
        },
        [onChange],
    )

    return (
        <div className={css.productSelectField}>
            <FieldPresentation name={name} description={description} />
            <ProductDropdown options={options} onChange={handleChange} />
        </div>
    )
}
