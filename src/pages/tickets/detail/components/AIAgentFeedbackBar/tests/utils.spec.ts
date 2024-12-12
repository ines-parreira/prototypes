import {Knowledge} from 'models/aiAgentFeedback/types'

import {getKnowledgeUrl} from '../utils'

describe('getKnowledgeUrl', () => {
    const shopType = 'shopType'
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
        expect(result).toBe(
            `/app/automation/${shopType}/${shopName}/ai-agent/knowledge`
        )
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
