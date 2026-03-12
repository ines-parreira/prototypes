import type { useGetMessageAiReasoning } from 'models/knowledgeService/queries'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import {
    coerceResourceType,
    parseReasoningResources,
} from './reasoningResources'

// Type helper for test resources
type AiReasoningResource = NonNullable<
    ReturnType<typeof useGetMessageAiReasoning>['data']
>['resources'][number]

const createTestResource = (
    overrides: Partial<AiReasoningResource> = {},
): AiReasoningResource => {
    return {
        resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        resourceId: 'default-id',
        resourceSetId: 'default-set-id',
        resourceTitle: '',
        resourceLocale: '',
        resourceVersion: null,
        taskIds: [],
        ...overrides,
    } as AiReasoningResource
}

/**
 * Helper to create an array of test resources with defaults
 */
const createTestResources = (
    ...resources: Partial<AiReasoningResource>[]
): AiReasoningResource[] => {
    return resources.map(createTestResource)
}

describe('coerceResourceType', () => {
    describe('action_execution handling', () => {
        it('should convert action_execution to ACTION', () => {
            const result = coerceResourceType(['action_execution', 'id123'])
            expect(result).toBe(AiAgentKnowledgeResourceTypeEnum.ACTION)
        })
    })

    describe('product handling', () => {
        it.each([
            {
                parts: ['product', 'id456', 'knowledge'],
                expected: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                description: 'knowledge subtype',
            },
            {
                parts: ['product', 'id789', 'recommendation'],
                expected:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                description: 'recommendation subtype',
            },
            {
                parts: ['product', 'id101', 'unknown'],
                expected: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                description: 'unknown subtype (defaults to PRODUCT_KNOWLEDGE)',
            },
            {
                parts: ['product', 'id102'],
                expected: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                description: 'no subtype (defaults to PRODUCT_KNOWLEDGE)',
            },
        ])('should handle product with $description', ({ parts, expected }) => {
            const result = coerceResourceType(parts)
            expect(result).toBe(expected)
        })
    })

    describe('standard resource type handling', () => {
        it.each([
            {
                parts: ['article', 'setId', 'id123'],
                expected: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                parts: ['guidance', 'setId', 'id456'],
                expected: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            },
            {
                parts: ['order', 'id789'],
                expected: AiAgentKnowledgeResourceTypeEnum.ORDER,
            },
            {
                parts: ['external_snippet', 'setId', 'id123'],
                expected: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            },
            {
                parts: ['file_external_snippet', 'setId', 'id456'],
                expected:
                    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            },
            {
                parts: ['store_website_question_snippet', 'setId', 'id789'],
                expected:
                    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            },
            {
                parts: ['macro', 'setId', 'id101'],
                expected: AiAgentKnowledgeResourceTypeEnum.MACRO,
            },
        ])('should uppercase $parts.0 to $expected', ({ parts, expected }) => {
            const result = coerceResourceType(parts)
            expect(result).toBe(expected)
        })
    })
})

describe('parseReasoningResources', () => {
    describe('resources with setId (ARTICLE, GUIDANCE, EXTERNAL_SNIPPET, FILE_EXTERNAL_SNIPPET, STORE_WEBSITE_QUESTION_SNIPPET)', () => {
        it.each([
            {
                type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                marker: 'article',
                setId: '100',
                resourceId: '13608',
                title: 'How to setup email',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                marker: 'guidance',
                setId: '50',
                resourceId: '789',
                title: 'Guidance document',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                marker: 'external_snippet',
                setId: '30',
                resourceId: 'snippet123',
                title: 'Code snippet',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                marker: 'file_external_snippet',
                setId: '40',
                resourceId: 'fileSnippet123',
                title: 'File snippet',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                marker: 'store_website_question_snippet',
                setId: '60',
                resourceId: 'wsq123',
                title: 'Website question',
            },
        ])(
            'should parse $marker resource with metadata',
            ({ type, marker, setId, resourceId, title }) => {
                const content = `Based on <<<${marker}::${setId}::${resourceId}>>>`
                const resources = createTestResources({
                    resourceType: type,
                    resourceSetId: setId,
                    resourceId,
                    resourceTitle: title,
                })

                const result = parseReasoningResources(content, resources)

                expect(result).toEqual([
                    {
                        resourceType: type,
                        resourceSetId: setId,
                        resourceId,
                        resourceTitle: title,
                        resourceVersion: null,
                        resourceLocale: '',
                    },
                ])
            },
        )

        it('should parse resource without metadata', () => {
            const content = 'Based on <<<article::100::13608>>>'
            const resources = createTestResources()

            const result = parseReasoningResources(content, resources)

            expect(result).toEqual([
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceId: '13608',
                    resourceTitle: undefined,
                    resourceVersion: undefined,
                    resourceLocale: undefined,
                },
            ])
        })
    })

    describe('ACTION resources', () => {
        it('should parse action resource with metadata', () => {
            const content = 'Executed <<<action_execution::exec123>>>'
            const resources = createTestResources({
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                resourceSetId: 'exec123',
                resourceId: 'action456',
                resourceTitle: 'Send Email',
            })

            const result = parseReasoningResources(content, resources)

            expect(result).toEqual([
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    resourceId: 'action456',
                    resourceTitle: 'Send Email',
                    resourceVersion: null,
                    resourceLocale: '',
                },
            ])
        })

        it('should parse action resource without metadata', () => {
            const content = 'Executed <<<action_execution::exec123>>>'
            const resources = createTestResources()

            const result = parseReasoningResources(content, resources)

            expect(result).toEqual([
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    resourceId: '',
                    resourceTitle: undefined,
                    resourceVersion: undefined,
                    resourceLocale: undefined,
                },
            ])
        })
    })

    describe('ORDER and PRODUCT resources', () => {
        it.each([
            {
                type: AiAgentKnowledgeResourceTypeEnum.ORDER,
                marker: 'order',
                resourceId: 'order123',
                title: 'Order #12345',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                marker: 'product',
                resourceId: 'prod123',
                subtype: 'knowledge',
                title: 'T-Shirt Blue',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                marker: 'product',
                resourceId: 'prod456',
                subtype: 'recommendation',
                title: 'Shoes Red',
            },
        ])(
            'should parse $marker resource with metadata',
            ({ type, marker, resourceId, subtype, title }) => {
                const content = `Based on <<<${marker}::${resourceId}${subtype ? `::${subtype}` : ''}>>>`
                const resources = createTestResources({
                    resourceType: type,
                    resourceId,
                    resourceSetId: '',
                    resourceTitle: title,
                })

                const result = parseReasoningResources(content, resources)

                expect(result).toEqual([
                    {
                        resourceType: type,
                        resourceId,
                        resourceTitle: title,
                        resourceVersion: null,
                        resourceLocale: '',
                    },
                ])
            },
        )

        it('should parse resource without metadata', () => {
            const content = 'Order <<<order::order456>>>'
            const resources = createTestResources()

            const result = parseReasoningResources(content, resources)

            expect(result).toEqual([
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                    resourceId: 'order456',
                    resourceTitle: undefined,
                    resourceVersion: undefined,
                    resourceLocale: undefined,
                },
            ])
        })
    })

    describe('multiple resources', () => {
        it('should parse multiple article resources', () => {
            const content =
                'Based on <<<article::100::13608>>> and <<<article::200::13609>>>'
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceId: '13608',
                    resourceTitle: 'Article 1',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '200',
                    resourceId: '13609',
                    resourceTitle: 'Article 2',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result).toHaveLength(2)
            expect(result[0].resourceId).toBe('13608')
            expect(result[1].resourceId).toBe('13609')
        })

        it('should parse multiple different resource types', () => {
            const content =
                'Based on <<<article::100::13608>>> and <<<order::order123>>> and <<<product::prod456::knowledge>>>'
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceId: '13608',
                    resourceTitle: 'Article',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                    resourceId: 'order123',
                    resourceSetId: '',
                    resourceTitle: 'Order',
                },
                {
                    resourceType:
                        AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                    resourceId: 'prod456',
                    resourceSetId: '',
                    resourceTitle: 'Product',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result).toHaveLength(3)
            expect(result[0].resourceType).toBe(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
            expect(result[1].resourceType).toBe(
                AiAgentKnowledgeResourceTypeEnum.ORDER,
            )
            expect(result[2].resourceType).toBe(
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
            )
        })
    })

    describe('unknown resource types', () => {
        it.each([
            { unknownMarker: 'unknown::123', description: 'unknown type' },
            { unknownMarker: 'discount::SAVE20', description: 'discount type' },
        ])('should filter out $description', ({ unknownMarker }) => {
            const content = `Based on <<<article::100::13608>>> and <<<${unknownMarker}>>>`
            const resources = createTestResources({
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceSetId: '100',
                resourceId: '13608',
                resourceTitle: 'Article',
            })

            const result = parseReasoningResources(content, resources)

            expect(result).toHaveLength(1)
            expect(result[0].resourceType).toBe(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
        })
    })

    describe('edge cases', () => {
        it.each([
            {
                content: '',
                description: 'empty content',
                expectedLength: 0,
            },
            {
                content: 'This is some reasoning text without any markers',
                description: 'no resource markers',
                expectedLength: 0,
            },
            {
                content: 'Based on <<<incomplete',
                description: 'malformed markers (incomplete)',
                expectedLength: 0,
            },
            {
                content: 'Based on <<<article::100::13608',
                description: 'markers without closing',
                expectedLength: 0,
            },
            {
                content: 'Based on <<<  article::100::13608  >>>',
                description: 'markers with extra whitespace',
                expectedLength: 0,
            },
        ])('should handle $description', ({ content, expectedLength }) => {
            const result = parseReasoningResources(content, [])
            expect(result).toHaveLength(expectedLength)
        })

        it('should handle duplicate resource markers', () => {
            const content =
                'Based on <<<article::100::13608>>> and <<<article::100::13608>>>'
            const resources = createTestResources({
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceSetId: '100',
                resourceId: '13608',
                resourceTitle: 'Article',
            })

            const result = parseReasoningResources(content, resources)

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual(result[1])
        })

        it('should handle content with line breaks between markers', () => {
            const content = `Based on <<<article::100::13608>>>
            and also <<<order::order123>>>`
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceId: '13608',
                    resourceTitle: 'Article',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                    resourceId: 'order123',
                    resourceSetId: '',
                    resourceTitle: 'Order',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result).toHaveLength(2)
        })
    })

    describe('metadata matching', () => {
        it('should match metadata by resourceId, resourceSetId, and resourceType for articles', () => {
            const content = 'Based on <<<article::100::13608>>>'
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceId: '13608',
                    resourceTitle: 'Correct Article',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '200', // Different set
                    resourceId: '13608',
                    resourceTitle: 'Wrong Article',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result[0].resourceTitle).toBe('Correct Article')
        })

        it('should match action metadata by resourceSetId and resourceType', () => {
            const content = 'Executed <<<action_execution::exec123>>>'
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    resourceSetId: 'exec123',
                    resourceId: 'action1',
                    resourceTitle: 'Correct Action',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    resourceSetId: 'exec456', // Different execution
                    resourceId: 'action2',
                    resourceTitle: 'Wrong Action',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result[0].resourceTitle).toBe('Correct Action')
            expect(result[0].resourceId).toBe('action1')
        })

        it('should match order/product metadata by resourceId and resourceType only', () => {
            const content = 'Order <<<order::order123>>>'
            const resources = createTestResources(
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                    resourceId: 'order123',
                    resourceSetId: 'set1',
                    resourceTitle: 'Correct Order',
                },
                {
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                    resourceId: 'order456',
                    resourceSetId: 'set1',
                    resourceTitle: 'Wrong Order',
                },
            )

            const result = parseReasoningResources(content, resources)

            expect(result[0].resourceTitle).toBe('Correct Order')
        })

        it.each([
            {
                type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                marker: 'action_execution::exec123',
                resourceSetId: 'exec123',
                resourceId: 'action1',
                title: 'Action',
                description: 'action',
            },
            {
                type: AiAgentKnowledgeResourceTypeEnum.ORDER,
                marker: 'order::order123',
                resourceSetId: '',
                resourceId: 'order123',
                title: 'Order',
                description: 'order',
            },
        ])(
            'should not include resourceSetId for $description resources',
            ({ type, marker, resourceSetId, resourceId, title }) => {
                const content = `Based on <<<${marker}>>>`
                const resources = createTestResources({
                    resourceType: type,
                    resourceSetId,
                    resourceId,
                    resourceTitle: title,
                })

                const result = parseReasoningResources(content, resources)

                expect(result[0]).not.toHaveProperty('resourceSetId')
            },
        )
    })
})
