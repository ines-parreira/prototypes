import { ldClientMock } from 'jest-launchdarkly-mock'

import { Knowledge } from 'models/aiAgentFeedback/types'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { getKnowledgeUrl, mapToKnowledgeSourceType } from '../utils'

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
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.MACRO),
        ).toBe('macro')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            ),
        ).toBe('website')
        expect(
            mapToKnowledgeSourceType(
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            ),
        ).toBe('external_snippet')
        expect(
            mapToKnowledgeSourceType(AiAgentKnowledgeResourceTypeEnum.ORDER),
        ).toBe('order')
    })
})
