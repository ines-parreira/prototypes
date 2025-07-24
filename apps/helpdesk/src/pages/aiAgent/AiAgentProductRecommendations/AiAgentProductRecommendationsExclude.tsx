import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import {
    Badge,
    Button,
    IconButton,
    LoadingSpinner,
    Skeleton,
} from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCT_RECOMMENDATIONS } from '../constants'
import { ProductSelectionDrawer } from './components/ProductSelectionDrawer'

import css from './AiAgentProductRecommendationsExclude.less'

export const AiAgentProductRecommendationsExclude = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const gorgiasDomain = currentAccount.get('domain')

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [deletingProductId, setDeletingProductId] = useState<number | null>(
        null,
    )

    const { integrationId } = useShopifyIntegrationAndScope(shopName!)

    const {
        data: productRecommendationRules,
        isLoading: isLoadingRules,
        isFetching: isFetchingRules,
    } = useGetRulesProductRecommendation(integrationId || 0)

    const excludedProductIds =
        productRecommendationRules?.excluded.flatMap((rule) =>
            rule.type === 'product'
                ? rule.items.map((item) => Number(item.target))
                : [],
        ) || []

    const {
        data: products,
        refetch,
        isLoading: isLoadingProducts,
        isFetching: isFetchingProducts,
    } = useGetProductsByIdsFromIntegration(
        integrationId || 0,
        excludedProductIds,
        !!integrationId && excludedProductIds.length > 0,
    )

    const {
        mutateAsync: upsertProductRecommendationRules,
        isLoading: isUpserting,
    } = useUpsertRulesProductRecommendation(integrationId || 0)

    const handleSubmit = async (productIds: number[]) =>
        upsertProductRecommendationRules({
            integrationId: integrationId || 0,
            data: {
                gorgiasDomain,
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: productIds.map((productId) => ({
                            target: productId.toString(),
                        })),
                    },
                ],
            },
        })

    const isFetching = isFetchingRules || isFetchingProducts
    const isLoading = isLoadingRules || isLoadingProducts

    useEffect(() => {
        if (!isFetching) {
            setDeletingProductId(null)
        }
    }, [isFetching])

    return (
        <AiAgentLayout
            shopName={shopName}
            title={PRODUCT_RECOMMENDATIONS}
            className={css.container}
        >
            <div className={css.card}>
                <div className={css.top}>
                    <div className={css.left}>
                        <div className={css.title}>Exclude products</div>
                        <div className={css.text}>
                            Choose products to exclude from recommendations.
                        </div>

                        {!isLoading && (
                            <div className={css.text}>
                                {excludedProductIds.length} product
                                {excludedProductIds.length !== 1 ? 's' : ''}
                            </div>
                        )}

                        {isLoading && <Skeleton width={300} height={32} />}
                    </div>
                    <div>
                        <Button
                            intent="secondary"
                            onClick={() => setIsDrawerOpen(true)}
                            isDisabled={
                                isUpserting || !!deletingProductId || isFetching
                            }
                        >
                            Add Products
                        </Button>
                    </div>
                </div>

                {isLoading && (
                    <div className={css.skeletonContainer}>
                        <Skeleton height={200} />
                    </div>
                )}

                {products?.map((product) => (
                    <div key={product.id} className={css.product}>
                        <div>
                            {product.image?.src ? (
                                <img
                                    className={css.productImage}
                                    src={product.image.src}
                                    alt={product.title}
                                />
                            ) : (
                                <div className={css.productImagePlaceholder} />
                            )}
                        </div>
                        <div className={css.productTitle}>{product.title}</div>
                        <div>
                            <Badge type="light-error" upperCase={false}>
                                Excluded
                            </Badge>
                        </div>
                        <div className={css.iconContainer}>
                            {deletingProductId === product.id && (
                                <LoadingSpinner size="small" />
                            )}

                            {deletingProductId !== product.id && (
                                <IconButton
                                    size="small"
                                    fillStyle="ghost"
                                    className={css.iconButton}
                                    onClick={async () => {
                                        setDeletingProductId(product.id)
                                        await handleSubmit(
                                            excludedProductIds.filter(
                                                (id) => id !== product.id,
                                            ),
                                        )
                                    }}
                                    aria-label="Delete product recommendation"
                                    icon="close"
                                    isDisabled={
                                        isUpserting || !!deletingProductId
                                    }
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ProductSelectionDrawer
                shopName={shopName}
                isOpen={isDrawerOpen}
                selectedProductIds={excludedProductIds}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={async (productIds) => {
                    await handleSubmit(productIds)
                    await refetch()
                    setIsDrawerOpen(false)
                }}
            />
        </AiAgentLayout>
    )
}
