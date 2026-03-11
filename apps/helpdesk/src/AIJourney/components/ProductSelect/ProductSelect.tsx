import { Icon, ListItem, Select, SelectTrigger, Skeleton } from '@gorgias/axiom'

import { useAIJourneyProductList } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import type { Product } from 'constants/integrations/types/shopify'

import css from './ProductSelect.less'

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

    const { productList, isLoading: isLoadingProducts } =
        useAIJourneyProductList({
            integrationId: integrationId,
        })

    if (isLoadingProducts) {
        return <Skeleton />
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
