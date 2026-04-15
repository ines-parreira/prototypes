import { useCallback, useEffect, useMemo, useState } from 'react'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import type { AiAgentReasoningState } from '@repo/ai-agent'
import {
    AiAgentMessageType,
    REASONING_CUTOFF_DATE,
    useCanAccessAIFeedback,
    useFeedbackTracking,
    useReasoningTracking,
} from '@repo/ai-agent'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Icon,
    Loader,
    Text,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { useAiAgentReasoning } from 'pages/aiAgent/hooks/useAiAgentReasoning'
import { useIsEvoliTicket } from 'pages/tickets/detail/hooks/useIsEvoliTicket'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { useKnowledgeSourceSideBar } from '../AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { AiAgentReasoningFeedback } from './AiAgentReasoningFeedback'
import { AiAgentReasoningContent } from './AiReasoningContent'

import css from './AiAgentReasoningHelpdeskV2.less'

type AiAgentReasoningProps = {
    message: TicketMessage
}

const EVOLI_STATIC_MESSAGE =
    "Message powered by AI Agent's new brain (beta). Reasoning will be available soon."

const IMPERSONATION_REASONING_NOTICE =
    'Reasoning is visible because you are impersonating this account.'

export const AiAgentReasoningHelpdeskV2 = ({
    message,
}: AiAgentReasoningProps) => {
    const ticket = useAppSelector(getTicketState)
    const isEvoliTicket = useIsEvoliTicket()
    const isImpersonated = useMemo(() => isSessionImpersonated(), [])
    const isMessageAfterEvoliCutoff =
        new Date(message.created_datetime).getTime() >
        REASONING_CUTOFF_DATE.getTime()
    const shouldUseEvoliStaticState =
        isEvoliTicket && !isMessageAfterEvoliCutoff && !isImpersonated

    const [state, setState] = useState<AiAgentReasoningState>(
        shouldUseEvoliStaticState ? 'static' : 'collapsed',
    )
    const [isRetriable] = useState(true)

    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const canAccessAIFeedback = useCanAccessAIFeedback()
    const { search } = useLocation()

    const searchParams = useMemo(() => new URLSearchParams(search), [search])
    const shouldDisplayExecutionId =
        isImpersonated || searchParams.get('showAiAgentExecutionIds') === 'true'
    const shouldShowImpersonationNotice = isImpersonated && isEvoliTicket

    const ticketId = Number(ticket.get('id') ?? 0)
    const accountId = Number(account.get('id') ?? 0)
    const userId = Number(currentUser.get('id') ?? 0)
    const messageId = Number(message.id ?? 0)
    const isHandover =
        (message.meta as Record<string, unknown>)?.ai_agent_message_type ===
        AiAgentMessageType.HANDOVER_TO_AGENT

    const { activeTab, onChangeTab } = useTicketInfobarNavigation()

    const { openPreview } = useKnowledgeSourceSideBar()

    const { onFeedbackTabOpened, onKnowledgeResourceClick } =
        useFeedbackTracking({
            ticketId,
            accountId,
            userId,
        })

    const { onReasoningOpened } = useReasoningTracking({
        ticketId,
        accountId,
        userId,
        messageId,
    })

    const isReasoningEnabled =
        state !== 'collapsed' &&
        ticketId > 0 &&
        messageId > 0 &&
        (!isEvoliTicket || isMessageAfterEvoliCutoff || isImpersonated)

    const {
        reasoningContent,
        reasoningResources,
        reasoningMetadata,
        staticMessage,
        storeConfiguration,
        refetch: refetchMessageAiReasoning,
    } = useAiAgentReasoning({
        objectId: ticketId > 0 ? ticketId.toString() : '',
        objectType: 'TICKET',
        messageId: messageId.toString(),
        enabled: isReasoningEnabled,
        isHandover,
    })

    useEffect(() => {
        if (reasoningContent === null) return
        if (staticMessage) {
            setState('static')
        } else if (state === 'loading' && !reasoningMetadata?.isLoading) {
            if (reasoningContent) {
                setState('expanded')
            } else {
                setState('error')
            }
        }
    }, [reasoningContent, staticMessage, state, reasoningMetadata?.isLoading])

    const handleExpandedChange = useCallback(
        (expanded: boolean) => {
            if (expanded) {
                setState('loading')
                onReasoningOpened()
            } else {
                setState('collapsed')
            }
        },
        [onReasoningOpened],
    )

    const handleTryAgain = useCallback(() => {
        setState('loading')
        refetchMessageAiReasoning()
    }, [refetchMessageAiReasoning])

    const handleGiveFeedback = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        onFeedbackTabOpened('give-feedback-buton-from-reasoning')
        onChangeTab(TicketInfobarTab.AIFeedback)
    }

    const isLoading = state === 'loading'
    const isError = state === 'error'
    const isExpanded = state === 'expanded'
    const isStatic = state === 'static'

    if (isStatic) {
        return (
            <>
                {shouldShowImpersonationNotice && (
                    <span className={css.impersonationNotice}>
                        <Icon
                            name="info"
                            size="sm"
                            color="content-accent-default"
                        />
                        {IMPERSONATION_REASONING_NOTICE}
                    </span>
                )}
                <div className={css.staticContainer}>
                    <span className={css.staticContent}>
                        {isEvoliTicket && (
                            <Icon
                                name="info"
                                size="sm"
                                color="content-accent-default"
                            />
                        )}
                        {shouldUseEvoliStaticState
                            ? EVOLI_STATIC_MESSAGE
                            : staticMessage}
                    </span>
                </div>
            </>
        )
    }

    const renderHeaderTitle = ({ isExpanded }: { isExpanded: boolean }) => {
        if (isLoading) {
            return (
                <Box display="flex" alignItems="center" gap="xxs">
                    <Loader size="sm" />
                    <Text size="sm" color="content-neutral-secondary">
                        Loading AI Agent reasoning
                    </Text>
                </Box>
            )
        }

        if (isError) {
            return (
                <Box display="flex" alignItems="center" py="xs">
                    <Text color="content-error-primary" size="sm">
                        Couldn&apos;t load reasoning. Please try again.
                    </Text>
                </Box>
            )
        }

        return (
            <Box display="flex" alignItems="center" gap="xxs">
                <Text size="sm" color="content-neutral-secondary">
                    {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
                </Text>
                <DropdownIcon isOpen={isExpanded} />
            </Box>
        )
    }

    const executionId = storeConfiguration?.executionId

    return (
        <>
            {shouldShowImpersonationNotice && (
                <span className={css.impersonationNotice}>
                    <Icon
                        name="info"
                        size="sm"
                        color="content-accent-default"
                    />
                    {IMPERSONATION_REASONING_NOTICE}
                </span>
            )}
            <Disclosure
                isExpanded={isExpanded}
                onExpandedChange={handleExpandedChange}
                isDisabled={isLoading || isError}
            >
                <DisclosureHeader
                    title={({ isExpanded }: { isExpanded: boolean }) =>
                        renderHeaderTitle({ isExpanded })
                    }
                    trailingSlot={null}
                />
                {isError && isRetriable && (
                    <Button
                        variant="secondary"
                        size="sm"
                        intent="regular"
                        onClick={handleTryAgain}
                    >
                        Try again
                    </Button>
                )}
                <DisclosurePanel pt="xxs">
                    <div className={css.panel}>
                        <div className={css.body}>
                            <AiAgentReasoningContent
                                reasoningContent={reasoningContent}
                                reasoningResources={reasoningResources}
                                data={reasoningMetadata?.data}
                                storeConfiguration={storeConfiguration}
                                ticketId={ticketId}
                                referenceDatetime={message.created_datetime}
                                openPreview={openPreview}
                                onKnowledgeResourceClick={
                                    onKnowledgeResourceClick
                                }
                            />
                        </div>
                        {!isEvoliTicket && executionId && (
                            <div className={css.footer}>
                                {canAccessAIFeedback && (
                                    <div className={css.feedbackContainer}>
                                        <AiAgentReasoningFeedback
                                            ticketId={ticketId}
                                            accountId={accountId}
                                            userId={userId}
                                            executionId={executionId}
                                            messageId={messageId}
                                        />
                                    </div>
                                )}
                                {shouldDisplayExecutionId && (
                                    <div className={css.executionId}>
                                        {`Execution ID: ${executionId}`}
                                    </div>
                                )}
                            </div>
                        )}
                        {canAccessAIFeedback && (
                            <Button
                                variant="secondary"
                                size="sm"
                                intent="regular"
                                isDisabled={
                                    activeTab === TicketInfobarTab.AIFeedback
                                }
                                onClick={handleGiveFeedback}
                            >
                                Give Feedback
                            </Button>
                        )}
                    </div>
                </DisclosurePanel>
            </Disclosure>
        </>
    )
}
