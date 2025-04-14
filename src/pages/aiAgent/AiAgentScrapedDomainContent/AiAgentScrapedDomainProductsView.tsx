import { useEffect, useState } from 'react'

import { useSearchParam } from 'hooks/useSearchParam'

import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import {
    CONTENT_TYPE,
    IngestionLogStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from './constant'
import ScrapedDomainContentView from './ScrapedDomainContentView'
import ScrapedDomainSelectedContent from './ScrapedDomainSelectedContent'
import { ScrapedContent } from './types'

type Props = {
    shopName: string
    helpCenterId: number
}

const AiAgentScrapedDomainProductsView = ({
    shopName,
    helpCenterId,
}: Props) => {
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)
    const [selectedProduct, setSelectedProduct] =
        useState<ScrapedContent | null>(null)

    const {
        storeDomain,
        storeUrl,
        storeDomainIngestionLog,
        isFetchLoading,
        syncTriggered,
        handleTriggerSync,
        handleOnSync,
        handleOnCancel,
    } = useSyncStoreDomain({ helpCenterId, shopName })

    const { syncIsPending } = usePollStoreDomainIngestionLog({
        helpCenterId,
        storeUrl,
        onStatusChange: setSyncStoreDomainStatus,
    })

    useEffect(() => {
        if (syncIsPending) {
            setSyncStoreDomainStatus(IngestionLogStatus.Pending)
        }
    }, [syncIsPending, setSyncStoreDomainStatus])

    const handleOnSelect = (content: ScrapedContent) => {
        setSelectedProduct(content)
        setIsOpened(true)
    }

    const handleOnClose = () => {
        setSelectedProduct(null)
        setIsOpened(false)
    }

    const [value, setSearchParam] = useSearchParam('page')
    const currentPage = Number(value) || 1

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setSearchParam(page.toString())
        }
    }

    // Mocked data to replace by actual data in the next iteration
    // https://linear.app/gorgias/issue/AIKNL-89/implement-functionality-for-product-content-tab
    const mockedProducts = storeDomainIngestionLog
        ? [
              {
                  id: 1,
                  title: 'Duo Baguette Birthstone Ring',
              },
              {
                  id: 2,
                  title: 'Lovely heart necklace',
              },
              {
                  id: 3,
                  title: 'Chain bracelet',
              },
              {
                  id: 4,
                  title: 'Elegant pearl earrings',
              },
              {
                  id: 5,
                  title: 'Stylish cuff bangle',
              },
              {
                  id: 6,
                  title: 'Classic hoop earrings',
              },
              {
                  id: 7,
                  title: 'Minimalist pendant necklace',
              },
              {
                  id: 8,
                  title: 'Chic statement earrings',
              },
              {
                  id: 9,
                  title: 'Vintage-inspired brooch',
              },
              {
                  id: 10,
                  title: 'Bohemian layered necklace',
              },
              {
                  id: 11,
                  title: 'Modern geometric ring',
              },
              {
                  id: 12,
                  title: 'Retro charm bracelet',
              },
              {
                  id: 13,
                  title: 'Sleek leather watch',
              },
              {
                  id: 14,
                  title: 'Delicate anklet',
              },
              {
                  id: 15,
                  title: 'Engraved initial ring',
              },
              {
                  id: 16,
                  title: 'Engraved initial bracelet',
              },
          ]
        : []

    const startIndex = (currentPage - 1) * PAGINATED_ITEMS_PER_PAGE
    const endIndex = startIndex + PAGINATED_ITEMS_PER_PAGE
    const paginatedProducts = mockedProducts.slice(startIndex, endIndex)

    return (
        <AiAgentScrapedDomainContentLayout
            shopName={shopName}
            storeDomainIngestionLog={storeDomainIngestionLog}
            storeDomain={storeDomain ?? null}
            storeUrl={storeUrl ?? null}
            isFetchLoading={isFetchLoading}
            syncTriggered={syncTriggered}
            handleOnSync={handleOnSync}
            handleOnCancel={handleOnCancel}
            handleTriggerSync={handleTriggerSync}
            syncStoreDomainStatus={syncStoreDomainStatus}
            onBannerClose={() => setSyncStoreDomainStatus(null)}
        >
            <ScrapedDomainContentView
                isLoading={isFetchLoading || syncIsPending}
                content={paginatedProducts}
                pageType={CONTENT_TYPE.PRODUCT}
                onSelect={handleOnSelect}
                hasNextItems={endIndex < mockedProducts.length}
                hasPrevItems={startIndex > 0}
                fetchNextItems={() => onPageChange(currentPage + 1)}
                fetchPrevItems={() => onPageChange(currentPage - 1)}
            />
            <ScrapedDomainSelectedContent
                selectedContent={selectedProduct}
                contentType={CONTENT_TYPE.PRODUCT}
                isOpened={isOpened}
                isLoading={isFetchLoading || syncIsPending}
                onClose={handleOnClose}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainProductsView
