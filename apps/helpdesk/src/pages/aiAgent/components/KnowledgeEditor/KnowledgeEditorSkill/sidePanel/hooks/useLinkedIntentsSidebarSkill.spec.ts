import { renderHook } from '@testing-library/react'

import { useLinkedIntentsSidebarSkill } from './useLinkedIntentsSidebarSkill'

const mockUseSkillEditorStore = jest.fn()

jest.mock('../../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

const createStoreState = (overrides?: Record<string, unknown>) => ({
    state: {
        mode: 'edit',
        intents: ['order::status', 'order::cancel'],
        skill: {
            intents: ['order::status', 'order::cancel'],
            isCurrent: true,
            publishedVersionId: 1,
            draftVersionId: 1,
        },
        historicalVersion: null,
        comparisonVersion: null,
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

describe('useLinkedIntentsSidebarSkill', () => {
    afterEach(() => jest.clearAllMocks())

    it('returns displayed intent IDs from skill', () => {
        setupStore()
        const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

        expect(result.current.displayedIntentIds).toEqual([
            'order::status',
            'order::cancel',
        ])
        expect(result.current.isDiffMode).toBe(false)
    })

    it('disables link button when updating', () => {
        setupStore({ isUpdating: true })
        const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

        expect(result.current.isLinkIntentsButtonDisabled).toBe(true)
        expect(result.current.canUnlinkIntentsFromSidebar).toBe(false)
    })

    it('shows tooltip when viewing historical version', () => {
        setupStore({
            historicalVersion: {
                publishedDatetime: '2025-01-01',
                intents: ['order::status'],
            },
        })
        const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

        expect(result.current.linkIntentsDisabledTooltip).toBe(
            'You are viewing a past version. Switch to the latest version to link intents.',
        )
        expect(result.current.displayedIntentIds).toEqual(['order::status'])
    })

    it('computes diff parts in diff mode', () => {
        setupStore({
            mode: 'diff',
            skill: {
                intents: ['order::status', 'order::cancel'],
                isCurrent: true,
                publishedVersionId: 1,
                draftVersionId: 1,
            },
            comparisonVersion: {
                intents: ['order::status'],
            },
        })
        const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

        expect(result.current.isDiffMode).toBe(true)
        expect(result.current.intentDiffParts).toEqual([
            { intentId: 'order::status', diffStatus: null },
            { intentId: 'order::cancel', diffStatus: 'added' },
        ])
    })

    it('formats intent labels with title case', () => {
        setupStore()
        const { result } = renderHook(() => useLinkedIntentsSidebarSkill())

        expect(result.current.getLinkedIntentLabelById('order::status')).toBe(
            'Order / Status',
        )
    })
})
