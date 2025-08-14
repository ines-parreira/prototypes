import React from 'react'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { sanitizeHtmlDefault } from 'utils/html'

import KnowledgeSourceRenderer from '../AIAgentFeedbackBar/KnowledgeSourceRenderer'
import { AiAgentKnowledgeResourceTypeEnum } from '../AIAgentFeedbackBar/types'
import { useGetResourcesReasoningMetadata } from '../AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'
import { knowledgeResourceShouldBeLink } from '../AIAgentFeedbackBar/utils'

import knowledgeSourceIconCss from '../AIAgentFeedbackBar/KnowledgeSourceIcon.less'
import css from './AiAgentReasoning.less'

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
}

export const AiAgentReasoningContent = ({
    reasoningContent,
    reasoningResources,
    data,
    storeConfiguration,

    openPreview,
}: AiAgentReasoningContentProps) => {
    if (reasoningContent === null) return null

    const resourceMatches = reasoningContent.match(/<<<(.*?)>>>/g) || []

    if (resourceMatches.length === 0) {
        return (
            <div className={css.contentWithIcons}>
                <ReactMarkdown>{reasoningContent}</ReactMarkdown>
            </div>
        )
    }

    let processedContent = reasoningContent
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
