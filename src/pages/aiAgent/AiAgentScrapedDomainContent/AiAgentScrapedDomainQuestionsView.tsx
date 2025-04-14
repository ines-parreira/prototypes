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

const AiAgentScrapedDomainQuestionsView = ({
    shopName,
    helpCenterId,
}: Props) => {
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)
    const [selectedQuestion, setSelectedQuestion] =
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
        setSelectedQuestion(content)
        setIsOpened(true)
    }

    const handleOnClose = () => {
        setSelectedQuestion(null)
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
    // https://linear.app/gorgias/issue/AIKNL-88/implement-functionality-for-pages-content-tab
    const mockedQuestions = storeDomainIngestionLog
        ? [
              {
                  id: 1,
                  title: 'What should I do if I received a defective item?',
              },
              {
                  id: 2,
                  title: 'What’s your return policy?',
              },
              {
                  id: 3,
                  title: 'How do exchanges work?',
              },
              {
                  id: 4,
                  title: 'What’s your shipping policy?',
              },
              {
                  id: 5,
                  title: 'Do you offer product warranties?',
              },
              {
                  id: 6,
                  title: 'Do you offer refunds?',
              },
              {
                  id: 7,
                  title: 'How can I access my account?',
              },
              {
                  id: 8,
                  title: 'Where are your products made?',
              },
              {
                  id: 9,
                  title: 'Do you have physical locations?',
              },
              {
                  id: 10,
                  title: 'Do you offer customization?',
              },
              {
                  id: 11,
                  title: 'How can I report an issue with my order?',
              },
              {
                  id: 12,
                  title: 'Do you offer discounts?',
              },
              {
                  id: 13,
                  title: 'How does your sizing work?',
              },
              {
                  id: 14,
                  title: 'Do you ship to all 50 states?',
              },
              {
                  id: 15,
                  title: 'Do you have a loyalty program?',
              },
              {
                  id: 16,
                  title: 'Do you have a new loyalty program?',
              },
          ]
        : []

    const startIndex = (currentPage - 1) * PAGINATED_ITEMS_PER_PAGE
    const endIndex = startIndex + PAGINATED_ITEMS_PER_PAGE
    const paginatedQuestions = mockedQuestions.slice(startIndex, endIndex)

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
                content={paginatedQuestions}
                onSelect={handleOnSelect}
                pageType={CONTENT_TYPE.QUESTION}
                hasNextItems={endIndex < mockedQuestions.length}
                hasPrevItems={startIndex > 0}
                fetchNextItems={() => onPageChange(currentPage + 1)}
                fetchPrevItems={() => onPageChange(currentPage - 1)}
            />
            <ScrapedDomainSelectedContent
                selectedContent={selectedQuestion}
                contentType={CONTENT_TYPE.QUESTION}
                isOpened={isOpened}
                isLoading={isFetchLoading || syncIsPending}
                onClose={handleOnClose}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsView
