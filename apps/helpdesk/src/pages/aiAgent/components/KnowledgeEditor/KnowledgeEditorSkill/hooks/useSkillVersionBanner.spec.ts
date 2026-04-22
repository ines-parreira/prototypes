import { renderHook } from '@testing-library/react'

import { useSkillVersionBanner } from './useSkillVersionBanner'

const mockUseSkillEditorStore = jest.fn()

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
    hasDraft: (state: {
        skill?: {
            publishedVersionId?: number | null
            draftVersionId?: number | null
        }
    }) => {
        const skill = state.skill
        return (
            skill?.publishedVersionId != null &&
            skill?.draftVersionId != null &&
            skill?.publishedVersionId !== skill?.draftVersionId
        )
    },
}))

jest.mock('./useSkillSwitchVersion', () => ({
    useSkillSwitchVersion: () => ({
        switchToVersion: jest.fn(),
    }),
}))

const setupStore = (
    stateOverrides: Record<string, unknown> = {},
    configOverrides: Record<string, unknown> = {},
) => {
    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector({
            state: {
                historicalVersion: null,
                skill: {
                    isCurrent: true,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                },
                isUpdating: false,
                isAutoSaving: false,
                ...stateOverrides,
            },
            config: {
                isPreviewMode: false,
                ...configOverrides,
            },
        }),
    )
}

describe('useSkillVersionBanner', () => {
    beforeEach(() => jest.clearAllMocks())

    it('returns isViewingDraft false when skill isCurrent is true', () => {
        setupStore()
        const { result } = renderHook(() => useSkillVersionBanner())

        expect(result.current.isViewingDraft).toBe(false)
        expect(result.current.hasPublishedVersion).toBe(true)
    })

    it('returns isViewingDraft true when skill isCurrent is false', () => {
        setupStore({
            skill: {
                isCurrent: false,
                publishedVersionId: 1,
                draftVersionId: 2,
            },
        })
        const { result } = renderHook(() => useSkillVersionBanner())

        expect(result.current.isViewingDraft).toBe(true)
        expect(result.current.hasDraftVersion).toBe(true)
    })

    it('returns isDisabled true when updating', () => {
        setupStore({ isUpdating: true })
        const { result } = renderHook(() => useSkillVersionBanner())

        expect(result.current.isDisabled).toBe(true)
    })

    it('returns isPreview true when isPreviewMode is true', () => {
        setupStore({}, { isPreviewMode: true })
        const { result } = renderHook(() => useSkillVersionBanner())

        expect(result.current.isPreview).toBe(true)
    })
})
