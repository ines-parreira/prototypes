import React from 'react'

import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { coerceResourceType } from 'pages/aiAgent/utils/reasoningResources'
import { sanitizeHtmlDefault } from 'utils/html'

import KnowledgeSourceRenderer from '../AIAgentFeedbackBar/KnowledgeSourceRenderer'
import { AiAgentKnowledgeResourceTypeEnum } from '../AIAgentFeedbackBar/types'
import type { useGetResourcesReasoningMetadata } from '../AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { knowledgeResourceShouldBeLink } from '../AIAgentFeedbackBar/utils'

import knowledgeSourceIconCss from '../AIAgentFeedbackBar/KnowledgeSourceIcon.less'
import css from './AiAgentReasoning.less'

const isKnownResourceType = (markerString: string): boolean => {
    const stringParts = markerString
        .replace('<<<', '')
        .replace('>>>', '')
        .split('::')

    const resourceType = coerceResourceType(stringParts)

    return Object.values(AiAgentKnowledgeResourceTypeEnum).includes(
        resourceType as AiAgentKnowledgeResourceTypeEnum,
    )
}

const getActionEventsUrl = ({
    resourceId,
    resourceType,
    shopName,
    ticketId,
    referenceDatetime,
}: {
    resourceId: string
    resourceType: AiAgentKnowledgeResourceTypeEnum
    shopName?: string
    ticketId?: number | null
    referenceDatetime?: string
}) => {
    if (
        resourceType !== AiAgentKnowledgeResourceTypeEnum.ACTION ||
        !resourceId ||
        !shopName ||
        !ticketId
    ) {
        return undefined
    }

    const actionEventsPath =
        getAiAgentNavigationRoutes(shopName).actionEvents(resourceId)
    const searchParams = new URLSearchParams({
        ticket: ticketId.toString(),
    })

    if (referenceDatetime) {
        searchParams.set(
            'start_datetime',
            moment
                .utc(referenceDatetime)
                .subtract(1, 'day')
                .startOf('day')
                .toISOString(),
        )
        searchParams.set(
            'end_datetime',
            moment
                .utc(referenceDatetime)
                .add(1, 'day')
                .endOf('day')
                .toISOString(),
        )
    }

    return `${actionEventsPath}?${searchParams.toString()}`
}

export type AiAgentReasoningContentProps = {
    reasoningContent: string | null
    reasoningResources: KnowledgeReasoningResource[]
    data?: NonNullable<
        ReturnType<typeof useGetResourcesReasoningMetadata>
    >['data']

    storeConfiguration?: {
        shopName?: string
        shopType?: string
    } | null
    ticketId?: number | null
    referenceDatetime?: string

    openPreview: (params: {
        id: string
        url: string
        title: string
        content: string
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
        helpCenterId?: string
        resourceVersion?: string | null
        resourceVersionId?: number
    }) => void

    onKnowledgeResourceClick?: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
}

export const AiAgentReasoningContent = ({
    reasoningContent,
    reasoningResources,
    data,
    storeConfiguration,
    ticketId,
    referenceDatetime,

    openPreview,
    onKnowledgeResourceClick,
}: AiAgentReasoningContentProps) => {
    if (reasoningContent === null) return null

    const allResourceMatches = reasoningContent.match(/<<<(.*?)>>>/g) || []
    const resourceMatches = allResourceMatches.filter(isKnownResourceType)

    let processedContent = reasoningContent

    // remove all unknown resource markers
    allResourceMatches.forEach((match) => {
        if (!isKnownResourceType(match)) {
            const contentMatch = match.match(/<<<(.*?)>>>/)
            if (contentMatch) {
                const innerContent = contentMatch[1]
                const sanitizedContent = sanitizeHtmlDefault(innerContent)
                const escapedPattern = `<<<${sanitizedContent}>>>`
                processedContent = processedContent.replace(
                    new RegExp(escapedPattern, 'g'),
                    '',
                )
            }
        }
    })

    if (resourceMatches.length === 0) {
        return (
            <div className={css.contentWithIcons}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {processedContent}
                </ReactMarkdown>
            </div>
        )
    }
    resourceMatches.forEach((match, index) => {
        const contentMatch = match.match(/<<<(.*?)>>>/)
        if (contentMatch) {
            const innerContent = contentMatch[1]
            const sanitizedContent = sanitizeHtmlDefault(innerContent)
            const escapedPattern = `<<<${sanitizedContent}>>>`
            processedContent = processedContent.replace(
                new RegExp(escapedPattern, 'g'),
                `<kbd id="${index}"></kbd>`,
            )
        }
    })

    return (
        <div className={css.contentWithIcons}>
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    p: ({ children }) => (
                        <div className={css.markdownParagraph}>
                            {React.Children.map(children, (child, index) => (
                                <div key={index} className={css.childParagraph}>
                                    {child}
                                </div>
                            ))}
                        </div>
                    ),
                    kbd: ({ id }: { id?: string }) => {
                        const index = parseInt(id as string)
                        const resource = reasoningResources[index]
                        const resourceData = data?.[index]

                        if (!resource || !resourceData) {
                            return null
                        }

                        const isDeleted =
                            'isDeleted' in resourceData
                                ? resourceData.isDeleted
                                : false
                        const resourceType =
                            resource.resourceType as AiAgentKnowledgeResourceTypeEnum

                        const isLink =
                            knowledgeResourceShouldBeLink(resourceType)
                        const resourceUrl =
                            getActionEventsUrl({
                                resourceId: resource.resourceId,
                                resourceType,
                                shopName: storeConfiguration?.shopName,
                                ticketId,
                                referenceDatetime,
                            }) ||
                            ('url' in resourceData ? resourceData.url : '')

                        // If the resource does not have a title it means that there was no match from the query resources so the ID of the resource is hallucinated
                        if (isDeleted && !resource.resourceTitle) {
                            return null
                        }

                        const handleClick = isDeleted
                            ? undefined
                            : () => {
                                  if (isLink) {
                                      if (resourceUrl) {
                                          onKnowledgeResourceClick?.(
                                              resource.resourceId,
                                              resourceType,
                                              resource.resourceSetId || '',
                                          )
                                          window.open(resourceUrl, '_blank')
                                      }
                                  } else {
                                      openPreview({
                                          id: resource.resourceId,
                                          url:
                                              'url' in resourceData
                                                  ? (resourceData.url ?? '')
                                                  : '',
                                          title:
                                              resourceData.title ||
                                              resource.resourceTitle ||
                                              '',
                                          content: resourceData.content,
                                          knowledgeResourceType: resourceType,
                                          helpCenterId: resource.resourceSetId,
                                          resourceVersionId:
                                              'versionId' in resourceData
                                                  ? (resourceData.versionId as number)
                                                  : undefined,
                                      })
                                  }
                              }

                        return (
                            <KnowledgeSourceRenderer
                                id={`source-reasoning-${resource.resourceId}-${resource.resourceType}-${index}`}
                                resourceType={resource.resourceType}
                                title={
                                    resource.resourceTitle ?? resourceData.title
                                }
                                content={
                                    isDeleted
                                        ? 'This resource has been deleted.'
                                        : resourceData.content
                                }
                                url={
                                    'url' in resourceData
                                        ? (resourceData.url ?? '')
                                        : ''
                                }
                                helpCenterId={resource.resourceSetId}
                                shopName={storeConfiguration?.shopName ?? ''}
                                shopType={storeConfiguration?.shopType ?? ''}
                                iconClassName={`${css.knowledgeSourceIcon} ${knowledgeSourceIconCss.reasoningBadge}`}
                                onClick={handleClick}
                                forceShowBody
                                isDraft={resource.resourceIsDraft}
                            />
                        )
                    },
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    )
}
