import React, { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import KnowledgeSourcePopover from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import { mapToKnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { getTicketState } from 'state/ticket/selectors'
import { changeActiveTab, getActiveTab } from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { sanitizeHtmlDefault } from 'utils/html'

import css from './AiAgentReasoning.less'

type AiAgentReasoningState = 'loading' | 'collapsed' | 'expanded' | 'error'

type AiAgentReasoningProps = {
    messageId?: number
}

export const parseReasoningResources = (
    content: string,
): KnowledgeReasoningResource[] => {
    return (content.match(/\{\{[^}]+\}\}/g) || [])
        .map((resourceString) => {
            const stringParts = resourceString
                .replace('{{', '')
                .replace('}}', '')
                .split('::')
            switch (stringParts[0]) {
                case 'ARTICLE':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'GUIDANCE':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'ACTION':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[1],
                    }
                case 'MACRO':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'FILE_EXTERNAL_SNIPPET':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'EXTERNAL_SNIPPET':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                    }
                case 'ORDER':
                    return {
                        resourceType:
                            stringParts[0] as AiAgentKnowledgeResourceTypeEnum,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                        resourceTitle: stringParts[3],
                    }
                default:
                    return null
            }
        })
        .filter(
            (resource): resource is NonNullable<typeof resource> =>
                resource !== null,
        )
}

export const AiAgentReasoning = ({
    // eslint-disable-next-line no-unused-vars
    messageId,
}: AiAgentReasoningProps) => {
    const [state, setState] = useState<AiAgentReasoningState>('collapsed')
    const [isRetriable] = useState(true)

    const ticket = useAppSelector(getTicketState)
    const ticketId: number = ticket.get('id')

    const activeTab = useAppSelector(getActiveTab)
    const dispatch = useAppDispatch()

    const mockReasoningContent = `Acknowledged the customer's confusion.
            Indicated that the AI Agent is working to clarify the information.
            Full details

            Sales

            The customer is in the CustomerInterestStage.READY_TO_BUY because they have added the 'Cheirosa 68 Beija Flor™ Perfume Mist' to their cart and are now asking questions about it [6715103903846].
            The next step is to clarify the previous product suggestion message in simple, clear language, explaining that the agent was recommending complementary perfume mists to pair with the 'Cheirosa 68 Beija Flor™ Perfume Mist'.
            The agent recommended 'Flor Mística Perfume Mist' [7446567059558], 'Água Mística Perfume Mist' [7446568140902], and 'Cheirosa 48 Perfume Mist' [7187838271590] because the customer has shown interest in the 'Cheirosa 68 Beija Flor™ Perfume Mist' [6715103903846], and these products are complementary perfume mists that pair well with it.
            Support

            The agent provided details about Cheirosa 68, including its inspiration, scent notes, and sizes, drawing from product details and knowledge about the fragrance [6715103903846, 790565, 1664446]. The agent also suggested related scents like Flor Mística and Cheirosa 48 [7446567059558, 7187838271590].

            Outcome

            The AI Agent is waiting for the customer to respond to the clarification, so the outcome is AIAgentDecisionOutcome.WAIT_FOR_CUSTOMER_RESPONSE.
            
            Test resource embeddings {{ARTICLE::16::13608}} {{GUIDANCE::26665::1045245}} {{ACTION::01J7KWHHMDY3H5S174D89VG7S3}} {{MACRO::45::67890}} {{FILE_EXTERNAL_SNIPPET::78::12345}} {{EXTERNAL_SNIPPET::89::54321}} {{ORDER::99::98765::#98765}}`

    const sanitizedReasoningContent = useMemo(
        () => sanitizeHtmlDefault(mockReasoningContent),
        [mockReasoningContent],
    )

    const reasoningResources = useMemo(
        () => parseReasoningResources(sanitizedReasoningContent),
        [sanitizedReasoningContent],
    )

    const shopName = 'artemisathletix'
    const shopType = 'shopify'

    // eslint-disable-next-line no-unused-vars
    const { data } = useGetResourcesReasoningMetadata({
        queriesEnabled: state !== 'collapsed',
        resources: reasoningResources.filter(
            (resource): resource is NonNullable<typeof resource> =>
                resource !== null,
        ),
        ticketId,
        storeConfiguration: {
            storeName: shopName,
            shopType,
        } as any,
    })

    const mockData = {
        isLoading: false,
        data: [
            // ARTICLE::16::13608
            {
                title: 'Cheirosa 68 Beija Flor™ Perfume Mist - Product Guide',
                content:
                    'Complete guide to Cheirosa 68 Beija Flor™ Perfume Mist including scent notes, inspiration, and pairing recommendations. This fragrance combines floral and fruity elements with notes of jasmine, pink dragonfruit, and sheer vanilla.',
                url: 'https://artemisathletix.gorgias.help/en-us/articles/13608-cheirosa-68-beija-flor-perfume-mist-guide',
            },
            // GUIDANCE::26665::1045245
            {
                title: 'Sales Guidance: Perfume Mist Recommendations',
                content:
                    'Guidelines for recommending complementary perfume mists based on customer preferences. Focus on scent profiles, seasonal appropriateness, and cross-selling opportunities for fragrance collections.',
                url: '/app/aiagent/artemisathletix/guidance/1045245/edit',
            },
            // ACTION::01J7KWHHMDY3H5S174D89VG7S3
            {
                title: 'Suggest Complementary Products',
                content: 'Suggest Complementary Products',
                url: '/app/aiagent/artemisathletix/actions/01J7KWHHMDY3H5S174D89VG7S3/edit',
            },
            // MACRO::45::67890
            {
                title: 'Customer Confusion Response Macro',
                content:
                    'Standard macro for responding to customer confusion about product recommendations.',
                url: '/app/macros/67890/edit',
            },
            // FILE_EXTERNAL_SNIPPET::78::12345
            {
                title: 'Product Specification Document',
                content:
                    'External file containing detailed product specifications and technical data.',
                url: '/app/files/external/12345/view',
            },
            // EXTERNAL_SNIPPET::89::54321
            {
                title: 'Fragrance Pairing Guide - External Link',
                content:
                    'External Link content about fragrance layering and pairing recommendations.',
                url: 'https://example-beauty-site.com/fragrance-pairing-guide',
            },
            // ORDER::99::98765
            {
                title: 'Order #98765 - Previous Purchase Data',
                content:
                    "Customer's previous order containing Cheirosa fragrance products for context.",
                url: '/app/orders/98765/details',
            },
        ],
    }

    const renderContentWithIcons = useMemo(() => {
        const resourceMatches =
            sanitizedReasoningContent.match(/\{\{[^}]+\}\}/g) || []

        if (resourceMatches.length === 0) {
            return sanitizedReasoningContent
        }

        const parts = sanitizedReasoningContent.split(/\{\{[^}]+\}\}/)
        const elements: (string | React.ReactElement)[] = []

        parts.forEach((part, index) => {
            elements.push(part)
            if (index < resourceMatches.length) {
                const resource = reasoningResources[index]
                const resourceData = mockData.data[index]
                if (resource && resourceData) {
                    elements.push(
                        <KnowledgeSourcePopover
                            id={resource.resourceId}
                            key={`resource-${index}`}
                            knowledgeResourceType={resource.resourceType}
                            url={resourceData.url}
                            title={resourceData.title}
                            content={resourceData.content}
                            shopName={shopName}
                            shopType={shopType}
                        >
                            {(ref, eventHandlers) => (
                                <span ref={ref} {...eventHandlers}>
                                    <KnowledgeSourceIcon
                                        type={mapToKnowledgeSourceType(
                                            resource.resourceType,
                                        )}
                                        badgeIconClassname={
                                            css.knowledgeSourceIcon
                                        }
                                    />
                                </span>
                            )}
                        </KnowledgeSourcePopover>,
                    )
                }
            }
        })

        return elements
    }, [sanitizedReasoningContent, reasoningResources, mockData.data])

    const handleToggleExpansion = useCallback(() => {
        if (state === 'collapsed') {
            setState('loading')
        } else if (state === 'expanded') {
            setState('collapsed')
        }
    }, [state])

    const handleTryAgain = useCallback(() => {
        setState('loading')
        setTimeout(() => {
            setState('expanded')
        }, 3000)
    }, [])

    const handleGiveFeedback = () => {
        dispatch(
            changeActiveTab({ activeTab: TicketAIAgentFeedbackTab.AIAgent }),
        )
    }

    const isLoading = state === 'loading'
    const isError = state === 'error'
    const isExpanded = state === 'expanded'
    const isLoaded = state === 'collapsed' || state === 'expanded'

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setState('expanded')
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    const renderTitle = () => {
        if (isLoading) {
            return (
                <>
                    <i
                        className={classNames(
                            'material-icons',
                            css.sparklesIcon,
                            css.loading,
                        )}
                    >
                        auto_awesome
                    </i>
                    <span className={classNames(css.text, css.loading)}>
                        Loading reasoning...
                    </span>
                </>
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
            <>
                {!isExpanded && (
                    <i className={classNames('material-icons', css.expandIcon)}>
                        keyboard_arrow_down
                    </i>
                )}
                {isExpanded && (
                    <i className={classNames('material-icons', css.expandIcon)}>
                        keyboard_arrow_up
                    </i>
                )}
                <span className={css.text}>
                    {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
                </span>
            </>
        )
    }

    const renderBody = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.body, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                })}
            >
                <div style={{ whiteSpace: 'pre-line' }}>
                    {renderContentWithIcons}
                </div>
            </div>
        )
    }

    const renderFooter = () => {
        if (isError) {
            return null
        }

        return (
            <div
                className={classNames(css.footer, {
                    [css.expanded]: isExpanded,
                    [css.loading]: isLoading,
                })}
            >
                {isExpanded && (
                    <Button
                        intent="secondary"
                        size="small"
                        fillStyle="fill"
                        isDisabled={
                            activeTab === TicketAIAgentFeedbackTab.AIAgent
                        }
                        onClick={handleGiveFeedback}
                        className={classNames({
                            [css.activeButton]:
                                activeTab === TicketAIAgentFeedbackTab.AIAgent,
                        })}
                    >
                        Give Feedback
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div
            className={classNames(css.container, {
                [css.loading]: isLoading,
                [css.error]: isError,
                [css.expanded]: isExpanded,
            })}
        >
            <div
                className={classNames(css.title, { [css.clickable]: isLoaded })}
                onClick={isLoaded ? handleToggleExpansion : undefined}
            >
                {renderTitle()}
            </div>
            {renderBody()}
            {renderFooter()}
        </div>
    )
}
