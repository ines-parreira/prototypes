import { useEffect, useState } from 'react'

import { useParams } from 'react-router'

import { FeatureFlagKey } from 'config/featureFlags'
import { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import { useFlag } from 'core/flags'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import history from 'pages/history'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import {
    CONTENT_TYPE,
    HeaderType,
    IngestionLogStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from './constant'
import { usePaginatedProductIntegration } from './hooks/usePaginatedProductIntegration'
import { useSelectedProductAndDetail } from './hooks/useSelectedProductAndDetail'
import ScrapedDomainContentView from './ScrapedDomainContentView'
import ScrapedDomainSelectedContent from './ScrapedDomainSelectedContent'

type Props = {
    shopName: string
    helpCenterId: number
}

const AiAgentScrapedDomainProductsView = ({
    shopName,
    helpCenterId,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const { productId } = useParams<{ productId?: string }>()
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)
    const isActionDrivenAiAgentNavigationEnabled = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )

    const {
        storeDomain,
        storeUrl,
        storeDomainIngestionLog,
        isFetchLoading,
        syncTriggered,
        handleTriggerSync,
        handleOnSync,
        handleOnCancel,
    } = useSyncStoreDomain({
        helpCenterId,
        shopName,
        onStatusChange: setSyncStoreDomainStatus,
    })

    const { syncIsPending } = usePollStoreDomainIngestionLog({
        helpCenterId,
        shopName,
        storeUrl,
        onStatusChange: setSyncStoreDomainStatus,
    })

    useEffect(() => {
        if (syncIsPending) {
            setSyncStoreDomainStatus(IngestionLogStatus.Pending)
        }
    }, [syncIsPending, setSyncStoreDomainStatus])

    const handleOnSelect = (id: number) =>
        history.push(
            isActionDrivenAiAgentNavigationEnabled
                ? routes.productsDetail(id)
                : routes.productsContentDetail(id),
        )

    const handleOnClose = () =>
        history.push(
            isActionDrivenAiAgentNavigationEnabled
                ? routes.products
                : routes.productsContent,
        )

    const { integrationId } = useShopifyIntegrationAndScope(shopName)

    const {
        itemsData: paginatedProducts,
        isLoading,
        searchTerm,
        setSearchTerm,
        fetchNext,
        fetchPrev,
        hasNextPage,
        hasPrevPage,
    } = usePaginatedProductIntegration({
        integrationId: integrationId || 0,
        initialParams: { limit: PAGINATED_ITEMS_PER_PAGE },
        enabled: !!integrationId,
    })

    const isDataLoading = isFetchLoading || isLoading
    const isSyncPending =
        syncIsPending || syncStoreDomainStatus === IngestionLogStatus.Pending

    const {
        selectedProduct,
        productDetail,
        isLoading: isFetchingProductAndDetail,
    } = useSelectedProductAndDetail({
        shopName,
        integrationId,
        productId: productId ?? null,
    })

    useEffect(() => {
        if (productId) {
            setIsOpened(true)
        } else {
            setIsOpened(false)
        }
    }, [productId])

    const children = (
        <>
            <ScrapedDomainContentView<ProductWithAiAgentStatus>
                shopName={shopName}
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                isLoading={isDataLoading || isSyncPending}
                contents={paginatedProducts}
                pageType={CONTENT_TYPE.PRODUCT}
                selectedId={productId ?? null}
                onSelect={handleOnSelect}
                hasNextItems={hasNextPage}
                hasPrevItems={hasPrevPage}
                fetchNextItems={fetchNext}
                fetchPrevItems={fetchPrev}
            />
            <ScrapedDomainSelectedContent
                shopName={shopName}
                latestSync={storeDomainIngestionLog?.latest_sync}
                selectedContent={selectedProduct}
                contentType={CONTENT_TYPE.PRODUCT}
                isOpened={isOpened}
                isLoading={syncIsPending || isFetchingProductAndDetail}
                onClose={handleOnClose}
                detail={productDetail}
            />
        </>
    )

    if (isActionDrivenAiAgentNavigationEnabled) {
        return children
    }

    return (
        <AiAgentScrapedDomainContentLayout
            shopName={shopName}
            latestSync={storeDomainIngestionLog?.latest_sync}
            storeDomain={storeDomain ?? null}
            storeUrl={storeUrl ?? null}
            isFetchLoading={isDataLoading}
            syncTriggered={syncTriggered}
            handleOnSync={handleOnSync}
            handleOnCancel={handleOnCancel}
            handleTriggerSync={handleTriggerSync}
            syncStoreDomainStatus={syncStoreDomainStatus}
            title="Store website"
            pageType={HeaderType.Domain}
        >
            {children}
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainProductsView
