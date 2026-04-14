import { renderHook } from '@testing-library/react'

import { useIntentConflicts } from './useIntentConflicts'

const mockUseSkillEditorStore = jest.fn()
const mockUseListIntents = jest.fn()

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: (...args: unknown[]) => mockUseListIntents(...args),
}))

const setupStore = (skillId?: number) => {
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            state: { skill: skillId != null ? { id: skillId } : undefined },
            config: { helpCenter: { id: 100 } },
        }),
    )
}

describe('useIntentConflicts', () => {
    afterEach(() => jest.clearAllMocks())

    it('returns empty set when no intents data', () => {
        setupStore(1)
        mockUseListIntents.mockReturnValue({ data: undefined })

        const { result } = renderHook(() => useIntentConflicts())

        expect(result.current.size).toBe(0)
    })

    it('returns empty set for new skills without an article id', () => {
        setupStore(undefined)
        mockUseListIntents.mockReturnValue({ data: undefined })

        const { result } = renderHook(() => useIntentConflicts())

        expect(result.current.size).toBe(0)
    })

    it('detects intents published by another skill', () => {
        setupStore(1)
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::status',
                        articles: [{ id: 1, status: 'published' }],
                    },
                    {
                        name: 'order::cancel',
                        articles: [{ id: 99, status: 'published' }],
                    },
                ],
            },
        })

        const { result } = renderHook(() => useIntentConflicts())

        expect(result.current.has('order::status')).toBe(false)
        expect(result.current.has('order::cancel')).toBe(true)
    })

    it('ignores intents with only draft articles from other skills', () => {
        setupStore(1)
        mockUseListIntents.mockReturnValue({
            data: {
                intents: [
                    {
                        name: 'order::cancel',
                        articles: [{ id: 99, status: 'draft' }],
                    },
                ],
            },
        })

        const { result } = renderHook(() => useIntentConflicts())

        expect(result.current.has('order::cancel')).toBe(false)
    })
})
