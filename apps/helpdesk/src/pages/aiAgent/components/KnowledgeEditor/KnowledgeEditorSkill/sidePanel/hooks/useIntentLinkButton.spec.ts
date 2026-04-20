import { renderHook } from '@testing-library/react'

import { useIntentLinkButton } from './useIntentLinkButton'

const mockUseSkillEditorStore = jest.fn()

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

const createStoreState = (overrides?: Record<string, unknown>) => ({
    state: {
        skill: {
            id: 1,
            isCurrent: true,
            publishedVersionId: 1,
            draftVersionId: 1,
        },
        historicalVersion: null,
        isUpdating: false,
        isAutoSaving: false,
        ...overrides,
    },
})

const setupStore = (overrides?: Record<string, unknown>) => {
    const storeState = createStoreState(overrides)
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector(storeState),
    )
}

describe('useIntentLinkButton', () => {
    afterEach(() => jest.clearAllMocks())

    it('enables link button in normal state', () => {
        setupStore()
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.isDisabled).toBe(false)
        expect(result.current.canUnlink).toBe(true)
        expect(result.current.disabledTooltip).toBeUndefined()
    })

    it('disables when updating', () => {
        setupStore({ isUpdating: true })
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.isDisabled).toBe(true)
        expect(result.current.canUnlink).toBe(false)
    })

    it('disables when auto-saving', () => {
        setupStore({ isAutoSaving: true })
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.isDisabled).toBe(true)
        expect(result.current.canUnlink).toBe(false)
    })

    it('shows historical tooltip when viewing historical version', () => {
        setupStore({
            historicalVersion: { publishedDatetime: '2025-01-01' },
        })
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.disabledTooltip).toBe(
            'You are viewing a past version. Switch to the latest version to link intents.',
        )
        expect(result.current.isDisabled).toBe(true)
    })

    it('shows no-article tooltip when skill has not been saved yet', () => {
        setupStore({ skill: undefined })
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.disabledTooltip).toBe(
            'Add a title and instructions first to link intents.',
        )
        expect(result.current.isDisabled).toBe(true)
    })

    it('shows draft tooltip when viewing published with draft', () => {
        setupStore({
            skill: {
                id: 1,
                isCurrent: true,
                publishedVersionId: 1,
                draftVersionId: 2,
            },
        })
        const { result } = renderHook(() => useIntentLinkButton())

        expect(result.current.disabledTooltip).toBe(
            'A draft of this skill exists. Switch to the draft to link intents.',
        )
        expect(result.current.isDisabled).toBe(true)
    })
})
