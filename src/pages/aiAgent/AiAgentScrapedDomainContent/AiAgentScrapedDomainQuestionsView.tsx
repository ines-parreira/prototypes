import { useEffect, useState } from 'react'

import { useParams } from 'react-router'

import { LocaleCode } from 'models/helpCenter/types'
import history from 'pages/history'

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { usePollStoreDomainIngestionLog } from '../hooks/usePollStoreDomainIngestionLog'
import { useSyncStoreDomain } from '../hooks/useSyncStoreDomain'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import { CONTENT_TYPE, IngestionLogStatus } from './constant'
import { useIngestedResourceMutation } from './hooks/useIngestedResourceMutation'
import { usePaginatedIngestedResources } from './hooks/usePaginatedIngestedResources'
import { useSelectedQuestionAndDetail } from './hooks/useSelectedQuestionAndDetail'
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
    const { routes } = useAiAgentNavigation({ shopName })
    const { id: selectedId } = useParams<{ id?: string }>()
    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)
    const [isOpened, setIsOpened] = useState(false)

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
        history.push(routes.pagesContentDetail(id))

    const handleOnClose = () => history.push(routes.pagesContent)

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
    const isSyncPending =
        syncIsPending || syncStoreDomainStatus === IngestionLogStatus.Pending

    const {
        selectedQuestion,
        questionDetail,
        isLoading: isFetchingQuestionAndDetail,
    } = useSelectedQuestionAndDetail({
        shopName,
        helpCenterId,
        defaultLocale,
        selectedId: selectedId ? Number(selectedId) : null,
        storeDomainIngestionLogId: storeDomainIngestionLog?.id ?? null,
    })

    useEffect(() => {
        if (selectedId && selectedQuestion) {
            setIsOpened(true)
        } else {
            setIsOpened(false)
        }
    }, [selectedId, selectedQuestion])

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
                isLoading={isDataLoading || isSyncPending}
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
                    isDataLoading ||
                    syncIsPending ||
                    isFetchingQuestionAndDetail
                }
                onClose={handleOnClose}
                detail={questionDetail}
                onUpdateStatus={updateIngestedResource}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsView
