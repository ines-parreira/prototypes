import {AIGuidance} from '../types'

export const getAIGuidanceFixture = (
    key: string,
    overrides: Partial<Omit<AIGuidance, 'key'>> = {}
): AIGuidance => ({
    key,
    name: `Name ${key}`,
    content: `Content ${key}`,
    batch_datetime: '2024-04-18T12:21:00.531Z',
    review_action: 'created',
    ...overrides,
})
