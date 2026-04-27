import { renderHook } from '@repo/testing'

import { useSkillVersionHistory } from './useSkillVersionHistory'

const mockUseSkillEditorStore = jest.fn()
const mockUseVersionHistoryBase = jest.fn()
const mockSwitchToVersion = jest.fn()

jest.mock('../context/KnowledgeEditorSkillContext', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
}))

jest.mock('../../shared/useVersionHistoryBase', () => ({
    useVersionHistoryBase: (...args: unknown[]) =>
        mockUseVersionHistoryBase(...args),
}))

jest.mock('./useSkillSwitchVersion', () => ({
    useSkillSwitchVersion: () => ({
        switchToVersion: mockSwitchToVersion,
    }),
}))

const defaultStoreState = {
    config: {
        shopName: 'test-shop',
        helpCenter: { id: 100, default_locale: 'en-US' },
    },
    state: {
        skill: {
            id: 1,
            isCurrent: false,
            publishedVersionId: 10,
            draftVersionId: 20,
        },
        historicalVersion: null,
        isUpdating: false,
        isAutoSaving: false,
    },
    dispatch: jest.fn(),
}

describe('useSkillVersionHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector(defaultStoreState),
        )
        mockUseVersionHistoryBase.mockReturnValue({
            versions: [],
            isLoading: false,
            isViewingHistoricalVersion: false,
        })
    })

    it('passes correct params to useVersionHistoryBase', () => {
        renderHook(() => useSkillVersionHistory())

        expect(mockUseVersionHistoryBase).toHaveBeenCalledWith(
            expect.objectContaining({
                shopName: 'test-shop',
                resourceType: 'guidance',
                helpCenterId: 100,
                articleId: 1,
                locale: 'en-US',
                currentVersionId: 10,
                draftVersionId: 20,
                isViewingDraft: true,
                switchToVersion: mockSwitchToVersion,
            }),
        )
    })

    it('sets isViewingDraft to false when viewing historical version', () => {
        mockUseSkillEditorStore.mockImplementation((selector: Function) =>
            selector({
                ...defaultStoreState,
                state: {
                    ...defaultStoreState.state,
                    historicalVersion: {
                        publishedDatetime: '2025-01-01',
                    },
                },
            }),
        )

        renderHook(() => useSkillVersionHistory())

        expect(mockUseVersionHistoryBase).toHaveBeenCalledWith(
            expect.objectContaining({
                isViewingDraft: false,
            }),
        )
    })
})
