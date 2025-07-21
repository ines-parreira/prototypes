import React, { useState } from 'react'

import { fetchShopTags } from 'models/integration/resources/shopify'
import { ShopifyIntegration, ShopifyTags } from 'models/integration/types'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import { useIntegrationContext } from 'pages/convert/campaigns/containers/IntegrationProvider'

type SelectedValues = {
    label: string
    value: string
}

type Props = {
    value: SelectedValues[]
    onChange: (value: SelectedValues[]) => void
    shopifyIntegration?: ShopifyIntegration
    className?: string
    shouldFetchOnFocus?: boolean
    singularText?: string
    pluralText?: string
}

export function ShopifyCustomerTagsInput({
    value,
    onChange,
    className,
    shouldFetchOnFocus = true,
    singularText = 'tag',
    pluralText = 'tags',
}: Props) {
    const [options, setOptions] = useState<Option[]>([])
    const { shopifyIntegration } = useIntegrationContext()

    const onFocus = async () => {
        if (shopifyIntegration) {
            try {
                const tags = await fetchShopTags(
                    shopifyIntegration.id,
                    ShopifyTags.customers,
                )
                setOptions(tags.map((tag) => ({ label: tag, value: tag })))
            } catch {
                // silent fail
                return
            }
        }
    }

    return (
        <MultiSelectOptionsField
            selectedOptions={value}
            plural={pluralText}
            singular={singularText}
            onChange={onChange}
            onFocus={shouldFetchOnFocus ? onFocus : () => {}}
            options={options}
            className={className}
            allowCustomOptions
            matchInput
            isCompact
        />
    )
}
