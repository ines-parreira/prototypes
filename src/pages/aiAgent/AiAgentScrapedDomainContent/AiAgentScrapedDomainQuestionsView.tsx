import { useEffect, useState } from 'react'

import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import { LocaleCode } from 'models/helpCenter/types'

import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import { CONTENT_TYPE, IngestionLogStatus } from './constant'
import { useIngestedResourceMutation } from './hooks/useIngestedResourceMutation'
import { usePaginatedIngestedResources } from './hooks/usePaginatedIngestedResources'
import ScrapedDomainContentView from './ScrapedDomainContentView'
import ScrapedDomainSelectedContent from './ScrapedDomainSelectedContent'
import { IngestedResourceWithArticleId } from './types'

type Props = {
    shopName: string
    helpCenterId: number
    defaultLocale: LocaleCode
}

const AiAgentScrapedDomainQuestionsView = ({
    shopName,
    helpCenterId,
    defaultLocale,
}: Props) => {
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)
    const [selectedQuestion, setSelectedQuestion] =
        useState<IngestedResourceWithArticleId | null>(null)

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
        shopName,
        storeUrl,
        onStatusChange: setSyncStoreDomainStatus,
    })

    useEffect(() => {
        if (syncIsPending) {
            setSyncStoreDomainStatus(IngestionLogStatus.Pending)
        }
    }, [syncIsPending, setSyncStoreDomainStatus])

    const handleOnSelect = (content: IngestedResourceWithArticleId) => {
        setSelectedQuestion(content)
        setIsOpened(true)
    }

    const handleOnClose = () => {
        setSelectedQuestion(null)
        setIsOpened(false)
    }

    const {
        contents: paginatedQuestions,
        isLoading: isListIngestedResourceLoading,
        searchTerm,
        setSearchTerm,
        fetchNext,
        fetchPrev,
        hasNextPage,
        hasPrevPage,
    } = usePaginatedIngestedResources({
        helpCenterId,
        ingestionLogId: storeDomainIngestionLog?.id ?? 0,
        enabled: !!storeDomainIngestionLog?.id,
    })

    const { updateIngestedResource } = useIngestedResourceMutation({
        helpCenterId,
        ingestionLogId: storeDomainIngestionLog?.id ?? 0,
    })

    const isDataLoading =
        isFetchLoading ||
        (!!storeDomainIngestionLog && isListIngestedResourceLoading)

    const { data: articleData, isInitialLoading: isFetchingArticleLoading } =
        useGetHelpCenterArticle(
            selectedQuestion?.article_id ?? 0,
            helpCenterId,
            defaultLocale,
            { enabled: !!selectedQuestion },
        )

    return (
        <AiAgentScrapedDomainContentLayout
            shopName={shopName}
            storeDomainIngestionLog={storeDomainIngestionLog}
            storeDomain={storeDomain ?? null}
            storeUrl={storeUrl ?? null}
            isFetchLoading={isDataLoading}
            syncTriggered={syncTriggered}
            handleOnSync={handleOnSync}
            handleOnCancel={handleOnCancel}
            handleTriggerSync={handleTriggerSync}
            syncStoreDomainStatus={syncStoreDomainStatus}
        >
            <ScrapedDomainContentView<IngestedResourceWithArticleId>
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                isLoading={isDataLoading || syncIsPending}
                contents={paginatedQuestions}
                onSelect={handleOnSelect}
                pageType={CONTENT_TYPE.QUESTION}
                hasNextItems={hasNextPage}
                hasPrevItems={hasPrevPage}
                fetchNextItems={fetchNext}
                fetchPrevItems={fetchPrev}
                onUpdateStatus={updateIngestedResource}
            />
            <ScrapedDomainSelectedContent
                selectedContent={selectedQuestion}
                contentType={CONTENT_TYPE.QUESTION}
                isOpened={isOpened}
                isLoading={
                    isDataLoading || syncIsPending || isFetchingArticleLoading
                }
                onClose={handleOnClose}
                detail={articleData}
                onUpdateStatus={updateIngestedResource}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsView
