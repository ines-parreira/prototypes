import { useEffect, useState } from 'react'

import {
    Button,
    CheckBoxField,
    IconButton,
    LoadingSpinner,
} from '@gorgias/merchant-ui-kit'

import useDebouncedEffect from 'hooks/useDebouncedEffect'
import { Drawer } from 'pages/common/components/Drawer'
import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { usePaginatedProductIntegration } from '../../AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'

import css from './ProductSelectionDrawer.less'

const PAGINATED_ITEMS_PER_PAGE = 25

export const ProductSelectionDrawer = ({
    shopName,
    isOpen,
    selectedProductIds,
    onClose,
    onSubmit,
}: {
    shopName: string
    isOpen: boolean
    selectedProductIds: number[]
    onClose: () => void
    onSubmit: (productIds: number[]) => Promise<void>
}) => {
    const [isEnabled, setIsEnabled] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localSelectedProductIds, setLocalSelectedProductIds] =
        useState(selectedProductIds)
    const [localSearchTerm, setLocalSearchTerm] = useState('')

    // Only load products when drawer is open
    useEffect(() => {
        if (!isOpen) {
            setLocalSelectedProductIds(selectedProductIds)
            return
        }

        setIsEnabled(true)
    }, [isOpen, selectedProductIds])

    useDebouncedEffect(
        () => {
            setSearchTerm(localSearchTerm)
        },
        [localSearchTerm],
        200,
    )

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const {
        itemsData: products,
        isLoading,
        setSearchTerm,
        fetchNext,
        fetchPrev,
        hasNextPage,
        hasPrevPage,
    } = usePaginatedProductIntegration({
        integrationId: integrationId || 0,
        initialParams: { limit: PAGINATED_ITEMS_PER_PAGE },
        enabled: !!integrationId && isEnabled,
    })

    const handleProductClick = (productId: number) =>
        setLocalSelectedProductIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        )

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label="Add products"
            open={isOpen}
            portalRootId="app-root"
            onBackdropClick={onClose}
        >
            <Drawer.Header>
                Add products
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-drawer"
                />
            </Drawer.Header>

            <Drawer.Content className={css.contentContainer}>
                <div className={css.contentInner}>
                    <div className={css.searchBar}>
                        <SearchBar
                            placeholder="Search products"
                            onChange={setLocalSearchTerm}
                            value={localSearchTerm}
                        />
                    </div>

                    <div className={css.products}>
                        {isLoading && (
                            <div className={css.loading}>
                                <LoadingSpinner size="big" />
                            </div>
                        )}

                        {!isLoading && products.length === 0 && (
                            <div className={css.noProducts}>
                                No products found
                            </div>
                        )}

                        {!isLoading &&
                            products?.map((product) => (
                                <div
                                    key={product.id}
                                    className={css.product}
                                    onClick={() =>
                                        handleProductClick(product.id)
                                    }
                                >
                                    <div>
                                        <CheckBoxField
                                            value={localSelectedProductIds.includes(
                                                product.id,
                                            )}
                                            onChange={() =>
                                                handleProductClick(product.id)
                                            }
                                        />
                                    </div>
                                    <div>
                                        {product.image?.src ? (
                                            <img
                                                className={css.productImage}
                                                src={product.image.src}
                                                alt={product.title}
                                            />
                                        ) : (
                                            <div
                                                className={
                                                    css.productImagePlaceholder
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className={css.productTitle}>
                                        {product.title}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </Drawer.Content>

            <Drawer.Footer>
                <div className={css.footerContainer}>
                    <div>
                        <IconButton
                            size="small"
                            fillStyle="ghost"
                            className={hasPrevPage ? css.iconButton : undefined}
                            onClick={fetchPrev}
                            aria-label="Previous page"
                            icon="chevron_left"
                            isDisabled={isLoading || !hasPrevPage}
                        />

                        <IconButton
                            size="small"
                            fillStyle="ghost"
                            className={hasNextPage ? css.iconButton : undefined}
                            onClick={fetchNext}
                            aria-label="Next page"
                            icon="chevron_right"
                            isDisabled={isLoading || !hasNextPage}
                        />
                    </div>

                    <div>
                        <Button
                            onClick={onClose}
                            intent="secondary"
                            size="medium"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={async () => {
                                setIsSubmitting(true)
                                await onSubmit(localSelectedProductIds)
                                setIsSubmitting(false)
                            }}
                            intent="primary"
                            type="submit"
                            isDisabled={isSubmitting}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </Drawer.Footer>
        </Drawer>
    )
}
