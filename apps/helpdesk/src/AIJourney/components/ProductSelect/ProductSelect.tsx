import { useCallback, useEffect, useState } from 'react'

import _debounce from 'lodash/debounce'

import {
    Icon,
    ListItem,
    Select,
    SelectTrigger,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import {
    useAIJourneyProductList,
    useLastSelectedProduct,
} from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import type { Product } from 'constants/integrations/types/shopify'

import css from './ProductSelect.less'

const SEARCH_DEBOUNCE_MS = 250

const ProductSelectTrigger = ({
    isOpen,
    currentProduct,
}: {
    isOpen: boolean
    currentProduct: Product
}) => (
    <div className={`${css.trigger} ${isOpen ? css.triggerOpen : ''}`}>
        <div className={css.triggerContent}>
            <img
                className={css.selectedProductImage}
                src={currentProduct?.image?.src}
                alt={currentProduct?.image?.alt || 'Product image'}
            />
            <span>{currentProduct?.title}</span>
        </div>
        <Icon name={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'} />
    </div>
)

export const ProductSelect = ({
    selectedProduct,
    setSelectedProduct,
}: {
    selectedProduct?: Product
    setSelectedProduct: (value: Product) => void
}) => {
    const { currentIntegration } = useJourneyContext()

    const integrationId = currentIntegration?.id

    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const {
        productList,
        isLoading: isLoadingProducts,
        isError,
    } = useAIJourneyProductList({
        integrationId,
        filter: debouncedSearch || undefined,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetSearch = useCallback(
        _debounce((value: string) => {
            setDebouncedSearch(value)
        }, SEARCH_DEBOUNCE_MS),
        [],
    )

    const handleSearchChange = (value: string) => {
        setSearchInput(value)
        debouncedSetSearch(value)
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSearchInput('')
            setDebouncedSearch('')
        }
    }

    const { resolveProduct } = useLastSelectedProduct()

    useEffect(() => {
        if (!selectedProduct && productList.length > 0) {
            const resolved = resolveProduct(productList)
            if (resolved) setSelectedProduct(resolved)
        }
    }, [productList, selectedProduct, setSelectedProduct, resolveProduct])

    if (isLoadingProducts) {
        return <Skeleton />
    }

    if (isError) {
        return (
            <Text>
                Products could not be loaded. Please check your Shopify
                integration.
            </Text>
        )
    }

    const currentProduct = selectedProduct ?? productList[0]

    return (
        <Select
            data-name="select-field"
            aria-label="Product"
            trigger={({ ref, isOpen }) => (
                <SelectTrigger ref={ref}>
                    <ProductSelectTrigger
                        isOpen={isOpen}
                        currentProduct={currentProduct}
                    />
                </SelectTrigger>
            )}
            items={productList}
            selectedItem={currentProduct}
            onSelect={(value) => setSelectedProduct(value)}
            isSearchable
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
            onOpenChange={handleOpenChange}
            isLoading={isLoadingProducts}
        >
            {(option: (typeof productList)[number]) => (
                <ListItem
                    id={option.id}
                    label={option.title}
                    leadingSlot={
                        <img
                            width="24px"
                            height="24px"
                            src={option.image?.src}
                            alt={option.image?.alt || 'Product image'}
                        />
                    }
                />
            )}
        </Select>
    )
}
