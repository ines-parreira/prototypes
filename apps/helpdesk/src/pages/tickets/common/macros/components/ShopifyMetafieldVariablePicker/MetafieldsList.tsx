import { useState } from 'react'

import { Skeleton, TextField } from '@gorgias/axiom'

import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'

import type { MetafieldsListProps } from './types'

import css from './ShopifyMetafieldVariablePicker.less'

export function MetafieldsList({
    integrationId,
    category,
    onSelect,
}: MetafieldsListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const { data: metafields, isLoading } = useMetafieldDefinitions({
        integrationId,
        pinned: true,
    })

    if (isLoading) {
        return (
            <div aria-label="loading">
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </div>
        )
    }

    const categoryMetafields = metafields.filter(
        (field): field is Field => field.category === category,
    )

    const filteredMetafields = categoryMetafields.filter((field) =>
        field.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (categoryMetafields.length === 0) {
        return <div className={css.emptyState}>No metafields imported</div>
    }

    return (
        <>
            <div
                className={css.searchContainer}
                onClick={(e) => e.stopPropagation()}
            >
                <TextField
                    placeholder="Search"
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>
            <div className={css.metafieldsList}>
                {filteredMetafields.length === 0 ? (
                    <div className={css.emptyState}>No metafields found</div>
                ) : (
                    filteredMetafields.map((field) => (
                        <button
                            key={field.id}
                            type="button"
                            onClick={() => onSelect(field)}
                            className={css.metafieldItem}
                        >
                            {field.name}
                        </button>
                    ))
                )}
            </div>
        </>
    )
}
