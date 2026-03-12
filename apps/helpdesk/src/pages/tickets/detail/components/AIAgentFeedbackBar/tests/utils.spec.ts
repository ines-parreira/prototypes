import { ldClientMock } from 'jest-launchdarkly-mock'

import type { StoreConfiguration } from 'models/aiAgent/types'
import type { Knowledge } from 'models/aiAgentFeedback/types'
import type { HelpCenter } from 'models/helpCenter/types'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import {
    getHelpCenterArticleUrl,
    getHelpcenterIdAsString,
    getHelpCenterIdByResourceType,
    getKnowledgeResourceTypeLabel,
    getKnowledgeUrl,
    mapToKnowledgeSourceType,
    parseKnowledgeResourceContent,
} from '../utils'

describe('getKnowledgeUrl', () => {
    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
    })

    const shopType = 'shopify'
    const shopName = 'shopName'

    it('should return the knowledge URL for type article', () => {
        const knowledge = {
            type: 'article',
            id: 1,
            name: 'article 1',
            url: 'https://example.com/article',
        } as Knowledge
        const result = getKnowledgeUrl(knowledge, shopType, shopName)
        expect(result).toBe('https://example.com/article')
    })

    it('should return the knowledge URL for type external_snippet', () => {
        const knowledge = {
            type: 'external_snippet',
            id: 2,
            name: 'snippet 2',
            url: 'https://example.com/snippet',
        } as Knowledge
        const result = getKnowledgeUrl(knowledge, shopType, shopName)
        expect(result).toBe('https://example.com/snippet')
    })

    it('should return the internal URL for type file_external_snippet', () => {
        const knowledge = {
            type: 'file_external_snippet',
            id: 3,
            name: 'file 3',
            url: 'https://storage.googleapis.com/test.pdf',
        } as Knowledge
        const result = getKnowledgeUrl(knowledge, shopType, shopName)
        expect(result).toBe(`/app/ai-agent/${shopType}/${shopName}/knowledge`)
    })

    it('should return the internal URL for type macro', () => {
        const knowledge = {
            type: 'macro',
            id: '123',
            name: 'macro 123',
        } as Knowledge
        const result = getKnowledgeUrl(knowledge, shopType, shopName)
        expect(result).toBe(`/app/settings/macros/123`)
    })
})

describe('getHelpCenterArticleUrl', () => {
    it('should return the article URL for Article type', () => {
        const helpCenter = {
            id: 3,
            name: 'Test Help Center',
            subdomain: 'test',
            locale: 'en-US',
        } as unknown as HelpCenter

        const result = getHelpCenterArticleUrl(
            getSingleArticleEnglish,
            helpCenter,
        )
        expect(result).toBe(
            'http://test.gorgias.docker:4000/en-US/uncategorized-article-18',
        )
    })
})

describe('mapToKnowledgeSourceType', () => {
    it('should return correct string for each known type', () => {
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.ARTICLE),
        ).toBe('article')
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.ACTION),
        ).toBe('action')
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.GUIDANCE),
        ).toBe('guidance')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            ),
        ).toBe('external_snippet')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            ),
        ).toBe('link')
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.ORDER),
        ).toBe('order')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            ),
        ).toBe('website')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
            ),
        ).toBe('product')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
            ),
        ).toBe('product')
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.MACRO),
        ).toBe('macro')
        expect(
            mapToKnowledgeSourceType(
                'unknown' as AiAgentKnowledgeResourceTypeEnum,
            ),
        ).toBe('article')
    })
})

describe('getKnowledgeResourceTypeLabel', () => {
    it('returns "Guidance" for GUIDANCE type', () => {
        expect(
            getKnowledgeResourceTypeLabel(
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            ),
        ).toBe('Guidance')
    })

    it('returns "Help Center article" for ARTICLE type', () => {
        expect(
            getKnowledgeResourceTypeLabel(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            ),
        ).toBe('Help Center article')
    })

    it('returns empty string for undefined', () => {
        expect(getKnowledgeResourceTypeLabel(undefined)).toBe('')
    })
})

describe('getHelpCenterIdByResourceType', () => {
    const storeConfiguration = {
        guidanceHelpCenterId: 123,
        helpCenterId: 456,
    } as StoreConfiguration

    it('returns guidanceHelpCenterId as string when type is GUIDANCE', () => {
        const result = getHelpCenterIdByResourceType(
            storeConfiguration,
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
        )
        expect(result).toBe(123)
    })

    it('returns helpCenterId as string when type is ARTICLE', () => {
        const result = getHelpCenterIdByResourceType(
            storeConfiguration,
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        )
        expect(result).toBe(456)
    })

    it('returns undefined when helpCenterId is missing', () => {
        const result = getHelpCenterIdByResourceType(
            { guidanceHelpCenterId: 123 } as StoreConfiguration,
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        )
        expect(result).toBeUndefined()
    })

    it('returns undefined for unknown type', () => {
        const result = getHelpCenterIdByResourceType(
            storeConfiguration,
            undefined,
        )
        expect(result).toBeUndefined()
    })
})
describe('parseKnowledgeResourceContent', () => {
    const content =
        '&&&customer.email&&& is cool$$$01JW674XH7CW5SP7VMHK9KJ3WZ$$$ $$$01JV61ETYEC8TCGQGDHQKERQVV$$$ &&&order.order_note&&& some radonm listtesttest1test2something bold'
    const guidanceVariables: any = [
        {
            name: 'Shopify',
            variables: [
                {
                    name: 'Email',
                    value: '&&&customer.email&&&',
                    category: 'customer',
                },
                {
                    name: 'Order Note',
                    value: '&&&order.order_note&&&',
                    category: 'order',
                },
            ],
        },
    ]
    const actions = [
        {
            name: 'Get Subscriptions',
            value: '01JW674XH7CW5SP7VMHK9KJ3WZ',
        },

        {
            name: 'Update shipping address',
            value: '01JV61ETYEC8TCGQGDHQKERQVV',
        },
    ]
    it('returns empty string for undefined', () => {
        expect(
            parseKnowledgeResourceContent(content, guidanceVariables, actions),
        ).toBe(
            'Customer: Email is coolUse action: Get Subscriptions Use action: Update shipping address Order: Order Note some radonm listtesttest1test2something bold',
        )
    })
})

describe('getHelpcenterIdAsString', () => {
    describe('when helpCenterId is a number', () => {
        it('returns string representation of the number', () => {
            expect(getHelpcenterIdAsString(123)).toBe('123')
        })
    })

    describe('when helpCenterId is a string', () => {
        it('returns the string as is', () => {
            expect(getHelpcenterIdAsString('456')).toBe('456')
        })
    })

    describe('when helpCenterId is null', () => {
        it('returns empty string', () => {
            expect(getHelpcenterIdAsString(null)).toBe('')
        })
    })

    describe('when helpCenterId is undefined', () => {
        it('returns empty string', () => {
            expect(getHelpcenterIdAsString(undefined)).toBe('')
        })
    })
})
