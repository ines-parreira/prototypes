import React from 'react'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
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

    openPreview: (params: {
        id: string
        url: string
        title: string
        content: string
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
        helpCenterId?: string
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

                        const isLink = knowledgeResourceShouldBeLink(
                            resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                        )

                        // If the resource does not have a title it means that there was no match from the query resources so the ID of the resource is hallucinated
                        if (isDeleted && !resource.resourceTitle) {
                            return null
                        }

                        const handleClick = isDeleted
                            ? undefined
                            : () => {
                                  if (isLink) {
                                      const resourceUrl =
                                          'url' in resourceData
                                              ? resourceData.url
                                              : ''
                                      if (resourceUrl) {
                                          onKnowledgeResourceClick?.(
                                              resource.resourceId,
                                              resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
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
                                          knowledgeResourceType:
                                              resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
                                          helpCenterId: resource.resourceSetId,
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
