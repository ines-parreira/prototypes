import { useEffect, useState } from 'react'

import { history } from '@repo/routing'
import { useParams } from 'react-router'

import type { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import {
    CONTENT_TYPE,
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

    const { storeDomain, storeUrl, storeDomainIngestionLog, isFetchLoading } =
        useSyncStoreDomain({
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
        history.push(routes.productsDetail(id))

    const handleOnClose = () => history.push(routes.products)

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
        additionalInfo,
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

    return (
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
                storeDomain={storeDomain}
                latestSync={storeDomainIngestionLog?.latest_sync}
                selectedContent={selectedProduct}
                contentType={CONTENT_TYPE.PRODUCT}
                isOpened={isOpened}
                isLoading={syncIsPending || isFetchingProductAndDetail}
                onClose={handleOnClose}
                detail={productDetail}
                integrationId={integrationId || null}
                additionalInfo={additionalInfo}
            />
        </>
    )
}

export default AiAgentScrapedDomainProductsView
