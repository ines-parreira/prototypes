import type { AIGuidance } from '../types'

export const getAIGuidanceFixture = (
    key: string,
    overrides: Partial<Omit<AIGuidance, 'key'>> = {},
): AIGuidance => ({
    key,
    name: `Name ${key}`,
    content: `Content ${key}`,
    review_action: 'created',
    ...overrides,
})
