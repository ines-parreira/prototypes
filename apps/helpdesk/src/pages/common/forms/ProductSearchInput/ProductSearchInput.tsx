import React, { useCallback, useContext } from 'react'

import _noop from 'lodash/noop'

import { INTEGRATION_DATA_ITEM_TYPE_PRODUCT } from 'constants/integration'
import { IntegrationDataItem } from 'models/integration/types'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { SearchResultType } from 'services/gorgiasApi'

import SearchInput, {
    Props as SearchInputProps,
} from '../SearchInput/SearchInput'
import Result, { Props as ResultProps } from './Result'

interface Props<
    ItemType extends IntegrationDataItem<unknown>,
    Variant extends SearchResultType,
> extends Pick<
        SearchInputProps<ItemType, Variant>,
        'renderResultsAppendix' | 'renderResultItemProps'
    > {
    className?: string
    autoFocus?: boolean
    searchOnFocus?: boolean
    getKey?: (item: ItemType) => string
    onVariantClicked: (item: ItemType, variant: Variant) => void
    dataMappers: {
        variantsPath: (item: ItemType) => Variant[]
        product: (item: ItemType) => ResultProps
        variants: (item: ItemType, variant: Variant) => ResultProps
    }
    hasError?: boolean
}

export default function ProductSearchInput<
    ItemType extends IntegrationDataItem<unknown>,
    Variant extends SearchResultType,
>({
    className,
    autoFocus = true,
    searchOnFocus = false,
    onVariantClicked = _noop,
    dataMappers,
    hasError = false,
    renderResultsAppendix,
    renderResultItemProps,
    getKey,
}: Props<ItemType, Variant>) {
    const { integrationId } = useContext(IntegrationContext)

    const handleProductClicked = useCallback(
        (item: ItemType): Variant[] => {
            const variants = dataMappers ? dataMappers.variantsPath(item) : []

            if (variants.length === 1) {
                onVariantClicked(item, variants[0])
            }

            return variants.length > 1 ? variants : []
        },
        [onVariantClicked, dataMappers],
    )

    return (
        <SearchInput<ItemType, Variant>
            endpoint={`/api/integrations/${
                integrationId || ''
            }/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`}
            placeholder="Search products..."
            renderResult={(props) => {
                const resultProps = dataMappers.product(props.result)
                return <Result ignoreStockAvailability {...resultProps} />
            }}
            renderSubResult={(props) => {
                const resultProps = dataMappers.variants(
                    props.result,
                    props.subResult,
                )
                return <Result ignoreStockAvailability {...resultProps} />
            }}
            className={className}
            autoFocus={autoFocus}
            searchOnFocus={searchOnFocus}
            onResultClicked={handleProductClicked}
            onSubResultClicked={onVariantClicked}
            resultLabel="product"
            resultLabelPlural="products"
            subResultLabel="variant"
            subResultLabelPlural="variants"
            hasError={hasError}
            renderResultsAppendix={renderResultsAppendix}
            renderResultItemProps={renderResultItemProps}
            getKey={getKey}
        />
    )
}
