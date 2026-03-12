import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import type { useGetMessageAiReasoning } from 'models/knowledgeService/queries'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

/**
 * Helper function to determine the specific product resource type based on subtype.
 */
const coerceProductSubType = (additionalParts: string[]) => {
    const subType = additionalParts[1]
    if (subType === 'knowledge') {
        return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
    }
    if (subType === 'recommendation') {
        return AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION
    }
    return AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE
}

/**
 * Coerces a resource type string from the reasoning content into a standardized resource type enum.
 *
 * Handles special cases like:
 * - `action_execution` → ACTION
 * - `product` with subtypes → PRODUCT_KNOWLEDGE or PRODUCT_RECOMMENDATION
 * - Other types are uppercased directly
 *
 * @param parts - The resource string split by '::' delimiter
 */
export const coerceResourceType = (parts: string[]) => {
    const [resourceType, ...additionalParts] = parts

    switch (resourceType) {
        case 'action_execution':
            return AiAgentKnowledgeResourceTypeEnum.ACTION
        case 'product':
            return coerceProductSubType(additionalParts)
        default:
            return resourceType.toUpperCase() as AiAgentKnowledgeResourceTypeEnum
    }
}

/**
 * Parses reasoning content to extract knowledge resources referenced in the text.
 *
 * Resources are identified by the pattern `<<<type::id::subId>>>` in the reasoning content.
 * This function:
 * 1. Finds all resource markers using regex
 * 2. Parses each marker to extract resource type and IDs
 * 3. Matches resources with metadata from the API response
 * 4. Filters out unknown resource types
 *
 * Supported resource formats:
 * - Articles, Guidance, Snippets: `<<<article::setId::resourceId>>>`
 * - Actions: `<<<action_execution::executionId>>>`
 * - Products, Orders: `<<<product::resourceId::subtype>>>`
 */
export const parseReasoningResources = (
    content: string,
    resources: NonNullable<
        ReturnType<typeof useGetMessageAiReasoning>['data']
    >['resources'],
): KnowledgeReasoningResource[] => {
    return (content.match(/<<<(.*?)>>>/g) || [])
        .map((resourceString) => {
            const stringParts = resourceString
                .replace('<<<', '')
                .replace('>>>', '')
                .split('::')
            let metadata

            const resourceType = coerceResourceType(stringParts)

            switch (resourceType) {
                case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
                case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
                case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
                case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceId === stringParts[2] &&
                            resource.resourceType === resourceType &&
                            resource.resourceSetId === stringParts[1],
                    )
                    return {
                        resourceType,
                        resourceId: stringParts[2],
                        resourceSetId: stringParts[1],
                        resourceTitle: metadata?.resourceTitle,
                        resourceIsDraft: metadata?.resourceIsDraft,
                        resourceVersion: metadata?.resourceVersion,
                        resourceLocale: metadata?.resourceLocale,
                    }
                case AiAgentKnowledgeResourceTypeEnum.ACTION:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceSetId === stringParts[1] &&
                            resource.resourceType === resourceType,
                    )
                    return {
                        resourceType,
                        resourceId: metadata?.resourceId || '',
                        resourceTitle: metadata?.resourceTitle,
                        resourceIsDraft: metadata?.resourceIsDraft,
                        resourceVersion: metadata?.resourceVersion,
                        resourceLocale: metadata?.resourceLocale,
                    }
                case AiAgentKnowledgeResourceTypeEnum.ORDER:
                case AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE:
                case AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION:
                    metadata = resources.find(
                        (resource) =>
                            resource.resourceId === stringParts[1] &&
                            resource.resourceType === resourceType,
                    )
                    return {
                        resourceType,
                        resourceId: stringParts[1],
                        resourceTitle: metadata?.resourceTitle,
                        resourceIsDraft: metadata?.resourceIsDraft,
                        resourceVersion: metadata?.resourceVersion,
                        resourceLocale: metadata?.resourceLocale,
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
