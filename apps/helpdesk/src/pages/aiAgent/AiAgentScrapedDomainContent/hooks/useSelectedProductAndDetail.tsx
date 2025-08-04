import { useEffect, useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGetEcommerceItemByExternalId } from 'models/ecommerce/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { ECOMMERCE_SOURCE, ECOMMERCE_TYPE } from '../constant'
import { isProductExcludedFromAiAgent } from './usePaginatedProductIntegration'

export const useSelectedProductAndDetail = ({
    shopName,
    integrationId,
    productId,
}: {
    shopName: string
    integrationId: number | null
    productId: string | null
}) => {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })
    const isActionDrivenAiAgentNavigationEnabled = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )

    const selectedProductData = useGetProductsByIdsFromIntegration(
        integrationId || 0,
        [productId ? Number(productId) : 0],
        !!productId,
        false,
    )

    const { data: ecommerceProduct, isLoading: isLoadingEcommerceProduct } =
        useGetEcommerceItemByExternalId(
            ECOMMERCE_TYPE,
            ECOMMERCE_SOURCE,
            integrationId || 0,
            productId ?? '',
            { enabled: !!productId },
        )

    const selectedProduct = useMemo(
        () =>
            selectedProductData?.data?.[0]
                ? {
                      ...selectedProductData.data[0],
                      is_used_by_ai_agent: !isProductExcludedFromAiAgent(
                          selectedProductData.data[0],
                      ),
                  }
                : null,
        [selectedProductData],
    )

    const ingestedProduct = useMemo(() => {
        if (!ecommerceProduct?.additional_info?.scraped_data?.data) {
            return null
        }
        return ecommerceProduct.additional_info.scraped_data.data
    }, [ecommerceProduct])

    useEffect(() => {
        if (
            selectedProductData.isError ||
            (!!productId && !selectedProductData.isLoading && !selectedProduct)
        ) {
            void dispatch(
                notify({
                    message:
                        'Content no longer exists. It may have been deleted or moved.',
                    status: NotificationStatus.Error,
                }),
            )

            history.push(
                isActionDrivenAiAgentNavigationEnabled
                    ? routes.products
                    : routes.productsContent,
            )
        }
    }, [
        selectedProductData,
        productId,
        selectedProduct,
        dispatch,
        routes.products,
        routes.productsContent,
        isActionDrivenAiAgentNavigationEnabled,
    ])

    return useMemo(() => {
        return {
            selectedProduct,
            productDetail: ingestedProduct,
            isError: selectedProductData.isError,
            isLoading:
                selectedProductData.isLoading || isLoadingEcommerceProduct,
        }
    }, [
        selectedProduct,
        ingestedProduct,
        selectedProductData,
        isLoadingEcommerceProduct,
    ])
}
