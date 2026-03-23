import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AiAgentReasoningState } from '@repo/ai-agent'
import * as aiAgent from '@repo/ai-agent'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import classNames from 'classnames'
import { useLocation } from 'react-router-dom'

import { LegacyButton as Button, Icon } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { useAiAgentReasoning } from 'pages/aiAgent/hooks/useAiAgentReasoning'
import { useIsEvoliTicket } from 'pages/tickets/detail/hooks/useIsEvoliTicket'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { useFeedbackTracking } from '../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from '../AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { useCanAccessAIFeedback } from '../TicketFeedback/hooks/useCanAccessAIFeedback'
import { AiAgentReasoningFeedback } from './AiAgentReasoningFeedback'
import { AiAgentReasoningContent } from './AiReasoningContent'
import { useReasoningTracking } from './hooks/useReasoningTracking'

import css from './AiAgentReasoning.less'

type AiAgentReasoningProps = {
    message: TicketMessage
}

const EVOLI_STATIC_MESSAGE =
    "Message powered by AI Agent's new brain (beta). Reasoning will be available soon."

export const AiAgentReasoning = ({ message }: AiAgentReasoningProps) => {
    const ticket = useAppSelector(getTicketState)
    const isEvoliTicket = useIsEvoliTicket()

    const [state, setState] = useState<AiAgentReasoningState>(
        isEvoliTicket ? 'static' : 'collapsed',
    )
    const [isRetriable] = useState(true)

    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const canAccessAIFeedback = useCanAccessAIFeedback()
    const { search } = useLocation()

    const isImpersonated = useMemo(() => isSessionImpersonated(), [])

    const searchParams = useMemo(() => new URLSearchParams(search), [search])
    const shouldDisplayExecutionId =
        isImpersonated || searchParams.get('showAiAgentExecutionIds') === 'true'

    const ticketId: number = ticket.get('id')
    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')
    const messageId = message.id || 0
    const isHandover =
        (message.meta as Record<string, unknown>)?.ai_agent_message_type ===
        aiAgent.AiAgentMessageType.HANDOVER_TO_AGENT

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

    const {
        reasoningContent,
        reasoningResources,
        reasoningMetadata,
        staticMessage,
        storeConfiguration,
        refetch: refetchMessageAiReasoning,
    } = useAiAgentReasoning({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
        messageId: messageId.toString(),
        enabled: !isEvoliTicket && state !== 'collapsed' && !!messageId,
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

    const handleToggleExpansion = useCallback(() => {
        if (state === 'collapsed') {
            setState('loading')
            onReasoningOpened()
        } else if (state === 'expanded') {
            setState('collapsed')
        }
    }, [state, onReasoningOpened])

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
    const isLoaded = state === 'collapsed' || state === 'expanded'

    const renderTitle = () => {
        if (isLoading) {
            return (
                <span className={classNames(css.text, css.loading)}>
                    Loading reasoning...
                </span>
            )
        }

        if (isError) {
            return (
                <>
                    <span className={css.textError}>
                        Couldn&apos;t load reasoning. Please try again.
                    </span>
                    {isRetriable && (
                        <Button
                            intent="secondary"
                            size="small"
                            fillStyle="fill"
                            onClick={handleTryAgain}
                            className={css.errorButton}
                        >
                            Try again
                        </Button>
                    )}
                </>
            )
        }

        return (
            <div className={css.titleContainer}>
                <div className={css.titleContent}>
                    {!isExpanded && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.expandIcon,
                            )}
                        >
                            keyboard_arrow_down
                        </i>
                    )}
                    {isExpanded && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.expandIcon,
                            )}
                        >
                            keyboard_arrow_up
                        </i>
                    )}
                    <span className={css.text}>
                        {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
                    </span>
                </div>
            </div>
        )
    }

    const renderBody = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.body, {
                    [css.expanded]: isExpanded || isStatic,
                    [css.loading]: isLoading,
                })}
            >
                {isStatic ? (
                    <span className={css.staticContent}>
                        {isEvoliTicket && (
                            <Icon
                                name="info"
                                size="sm"
                                color="content-accent-default"
                            />
                        )}
                        {isEvoliTicket ? EVOLI_STATIC_MESSAGE : staticMessage}
                    </span>
                ) : (
                    <>
                        <AiAgentReasoningContent
                            reasoningContent={reasoningContent}
                            reasoningResources={reasoningResources}
                            data={reasoningMetadata?.data}
                            storeConfiguration={storeConfiguration}
                            ticketId={ticketId}
                            referenceDatetime={message.created_datetime}
                            openPreview={openPreview}
                            onKnowledgeResourceClick={onKnowledgeResourceClick}
                        />
                    </>
                )}
            </div>
        )
    }

    const renderFooter = () => {
        const executionId = storeConfiguration?.executionId

        if (!executionId) {
            return null
        }

        const renderExecutionId = () => {
            if (!shouldDisplayExecutionId) {
                return null
            }

            return (
                <div className={css.executionId}>
                    {`Execution ID: ${executionId}`}
                </div>
            )
        }

        const renderFeedbackSection = () => {
            if (isError || !canAccessAIFeedback) {
                return null
            }

            return (
                <div className={css.feedbackContainer}>
                    <AiAgentReasoningFeedback
                        ticketId={ticketId}
                        accountId={accountId}
                        userId={userId}
                        executionId={executionId}
                        messageId={messageId}
                    />
                </div>
            )
        }

        const content = (
            <>
                {renderFeedbackSection()}
                {renderExecutionId()}
            </>
        )

        return (
            <div
                className={classNames(css.footer, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                    [css.static]: isStatic,
                })}
            >
                {content}
            </div>
        )
    }

    return (
        <>
            <div
                className={classNames(css.container, {
                    [css.loading]: isLoading,
                    [css.error]: isError,
                    [css.expanded]: isExpanded,
                    [css.static]: isStatic,
                })}
            >
                {!isStatic && (
                    <div
                        className={classNames(css.title, {
                            [css.clickable]: isLoaded,
                        })}
                        onClick={isLoaded ? handleToggleExpansion : undefined}
                    >
                        {renderTitle()}
                    </div>
                )}
                {renderBody()}
                {!isEvoliTicket && renderFooter()}
            </div>
            {canAccessAIFeedback && (
                <Button
                    intent="secondary"
                    size="small"
                    fillStyle="fill"
                    isDisabled={activeTab === TicketInfobarTab.AIFeedback}
                    onClick={handleGiveFeedback}
                    className={classNames(css.reviewButton, {
                        [css.activeButton]:
                            activeTab === TicketInfobarTab.AIFeedback,
                    })}
                >
                    Give Feedback
                </Button>
            )}
        </>
    )
}
