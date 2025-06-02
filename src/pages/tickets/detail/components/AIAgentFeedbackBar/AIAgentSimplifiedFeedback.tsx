import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { v4 as uuidv4 } from 'uuid'

import { Button, Separator } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import CreateKnowledgeSection from 'pages/tickets/detail/components/AIAgentFeedbackBar/CreateKnowledgeSection'
import FeedbackInternalNote from 'pages/tickets/detail/components/AIAgentFeedbackBar/FeedbackInternalNote'
import { useFeedbackActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions'
import KnowledgeSourceFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedback'
import { KnowledgeSourceFeedbackSkeleton } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceFeedbackSkeleton'
import MissingKnowledgeSelect from 'pages/tickets/detail/components/AIAgentFeedbackBar/MissingKnowledgeSelect'
import {
    AiAgentBinaryFeedbackEnum,
    AutoSaveState,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useEnrichFeedbackData } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getSectionIdByName } from 'state/entities/sections/selectors'
import { getTicketState } from 'state/ticket/selectors'
import { getViewsState } from 'state/views/selectors'

const AIAgentSimplifiedFeedback = () => {
    const [freeFormFeedback, setFreeFormFeedback] = useState('')
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [loadingMutations, setLoadingMutations] = useState<string[]>()

    const viewsState = useAppSelector(getViewsState)
    const existingSections = useAppSelector(getSectionIdByName)

    const showNextTicketButton =
        viewsState.getIn(['active', 'section_id']) ===
        existingSections['AI Agent']

    const [loadingFreeFormMutation, setLoadingFreeFormMutation] =
        useState<boolean>()
    const dirtyRef = useRef(false)
    const prevLoadingRef = useRef(true)

    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')

    const { goToTicket: goToNextTicket, isEnabled: isNextEnabled } =
        useGoToNextTicket(ticketId.toString())

    const { data: feedback } = useGetFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const lastUpdatedMutations = useMemo(() => {
        const maxDate = feedback?.executions?.reduce((acc, execution) => {
            return Math.max(
                acc,
                ...(execution.resources?.map((resource) =>
                    resource.feedback?.updatedDatetime
                        ? new Date(resource.feedback.updatedDatetime).getTime()
                        : 0,
                ) ?? []),
                ...(execution.feedback?.map((feedback) =>
                    feedback.updatedDatetime
                        ? new Date(feedback.updatedDatetime).getTime()
                        : 0,
                ) ?? []),
            )
        }, 0)

        return maxDate ? new Date(maxDate) : new Date()
    }, [feedback])

    const shopName =
        feedback?.executions?.[0]?.storeConfiguration?.shopName ?? ''

    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain: account.get('domain') as string,
        enabled: !!shopName,
    })

    const {
        isLoading: isLoadingEnrichedData,
        enrichedData,
        actions,
        macros,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
    } = useEnrichFeedbackData({
        ticketId,
        storeConfiguration,
        data: feedback,
    })

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const handleIconClick = async (
        value: AiAgentBinaryFeedbackEnum,
        resource: KnowledgeResource,
    ) => {
        const upsertId = resource.feedback?.id?.toString() ?? uuidv4()

        try {
            if (
                loadingMutations?.includes(upsertId) ||
                resource.feedback?.feedbackValue === value
            )
                return

            setLoadingMutations((oldValue) => [...(oldValue ?? []), upsertId])

            await upsertFeedback({
                feedbackToUpsert: [
                    {
                        id: resource.feedback?.id,
                        objectId: ticketId.toString(),
                        objectType: 'TICKET',
                        executionId:
                            resource.executionId ??
                            enrichedData.knowledgeResources?.[0]?.executionId ??
                            ticketId,
                        targetType: 'KNOWLEDGE_RESOURCE',
                        targetId: resource.resource.id,
                        feedbackValue: value,
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                    },
                ],
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingMutations((oldValue) =>
                oldValue?.filter((id) => id !== upsertId),
            )
        }
    }

    useEffect(() => {
        if (!isInitialLoad) return

        const wasLoading = prevLoadingRef.current
        prevLoadingRef.current = isLoadingEnrichedData

        if (wasLoading && !isLoadingEnrichedData) {
            setIsInitialLoad(false)
        }
    }, [isLoadingEnrichedData, isInitialLoad])

    useEffect(() => {
        if (loadingFreeFormMutation) return
        if (
            enrichedData.freeForm?.feedback?.feedbackValue !==
                freeFormFeedback &&
            !dirtyRef.current
        ) {
            setFreeFormFeedback(
                enrichedData.freeForm?.feedback?.feedbackValue ?? '',
            )
        }
    }, [enrichedData.freeForm, freeFormFeedback, loadingFreeFormMutation])

    const handleFreeFormFeedbackChange = useCallback(async () => {
        if (!dirtyRef.current) return

        dirtyRef.current = false

        setLoadingFreeFormMutation(true)

        await upsertFeedback({
            feedbackToUpsert: [
                {
                    id: enrichedData.freeForm?.feedback?.id,
                    objectId: ticketId.toString(),
                    objectType: 'TICKET',
                    executionId:
                        enrichedData.freeForm?.executionId ??
                        enrichedData.knowledgeResources?.[0]?.executionId ??
                        ticketId,
                    targetType: 'TICKET',
                    targetId: ticketId.toString(),
                    feedbackValue: freeFormFeedback,
                    feedbackType: 'TICKET_FREEFORM',
                },
            ],
        })

        setLoadingFreeFormMutation(false)
    }, [freeFormFeedback, ticketId, upsertFeedback, enrichedData])

    useDebouncedEffect(
        handleFreeFormFeedbackChange,
        [handleFreeFormFeedbackChange],
        1500,
    )

    const { onSubmitMissingKnowledge } = useFeedbackActions({
        upsertFeedback,
        feedback,
        ticketId,
        storeConfiguration,
        actions,
        guidanceArticles,
        articles,
        sourceItems,
        macros,
        ingestedFiles,
        enrichedData,
        setLoadingMutations,
    })

    const handleFeedbackInternalNoteChange = (value: string) => {
        if (
            (!value && !enrichedData.freeForm?.feedback?.feedbackValue) ||
            value === enrichedData.freeForm?.feedback?.feedbackValue ||
            value === freeFormFeedback
        ) {
            return
        }

        dirtyRef.current = true
        setFreeFormFeedback(value)
    }

    return (
        <>
            <div className={css.container}>
                {feedback && feedback.executions.length === 0 ? (
                    "We're still processing the details of this conversation. You'll be able to review shortly."
                ) : (
                    <>
                        <div className={css.heading}>
                            <span>Review knowledge used</span>
                            <AutoSaveBadge
                                state={
                                    !loadingMutations
                                        ? AutoSaveState.INITIAL
                                        : loadingMutations.length > 0
                                          ? AutoSaveState.SAVING
                                          : AutoSaveState.SAVED
                                }
                                updatedAt={lastUpdatedMutations}
                            />
                        </div>

                        <div className={css.sources}>
                            {isInitialLoad
                                ? Array.from({ length: 3 }).map((_, index) => (
                                      <KnowledgeSourceFeedbackSkeleton
                                          key={index}
                                      />
                                  ))
                                : enrichedData.knowledgeResources.length > 0
                                  ? enrichedData.knowledgeResources.map(
                                        (resource) => (
                                            <KnowledgeSourceFeedback
                                                key={resource.resource.id}
                                                onIconClick={handleIconClick}
                                                resource={resource}
                                            />
                                        ),
                                    )
                                  : 'No knowledge used'}
                        </div>

                        <MissingKnowledgeSelect
                            helpCenterId={storeConfiguration?.helpCenterId}
                            guidanceHelpCenterId={
                                storeConfiguration?.guidanceHelpCenterId
                            }
                            snippetHelpCenterId={
                                storeConfiguration?.snippetHelpCenterId
                            }
                            knowledgeResources={enrichedData.knowledgeResources}
                            enrichedData={{
                                isLoading: isLoadingEnrichedData,
                                enrichedData,
                                actions,
                                macros,
                                articles,
                                guidanceArticles,
                                sourceItems,
                                ingestedFiles,
                            }}
                            onSubmit={onSubmitMissingKnowledge}
                            onRemove={onSubmitMissingKnowledge}
                            initialValues={
                                enrichedData.suggestedResources ?? []
                            }
                            accountId={accountId}
                        />

                        <CreateKnowledgeSection
                            shopName={shopName as string}
                            helpCenterId={storeConfiguration?.helpCenterId}
                        />

                        <Separator className={css.separator} />
                        <FeedbackInternalNote
                            onChange={handleFeedbackInternalNoteChange}
                            isMutationLoading={loadingFreeFormMutation}
                            value={freeFormFeedback}
                            lastUpdated={
                                enrichedData.freeForm?.feedback?.updatedDatetime
                            }
                        />
                    </>
                )}
            </div>

            {showNextTicketButton && (
                <div className={css.footer}>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        trailingIcon="keyboard_arrow_right"
                        size="medium"
                        isDisabled={!isNextEnabled}
                        onClick={goToNextTicket}
                    >
                        Review next Ticket
                    </Button>
                </div>
            )}
        </>
    )
}

export default AIAgentSimplifiedFeedback
