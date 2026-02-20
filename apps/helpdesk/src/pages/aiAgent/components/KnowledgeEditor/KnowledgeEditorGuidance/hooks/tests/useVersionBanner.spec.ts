import { act, renderHook } from '@repo/testing'

import type { GuidanceArticle } from 'pages/aiAgent/types'

import { hasDraft, useGuidanceContext, useGuidanceStore } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useVersionBanner } from '../useVersionBanner'

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
    useGuidanceStore: jest.fn(),
    hasDraft: jest.fn(),
}))

const mockSwitchToVersion = jest.fn()
jest.mock('../useSwitchVersion', () => ({
    useSwitchVersion: () => ({ switchToVersion: mockSwitchToVersion }),
}))

describe('useVersionBanner', () => {
    const mockDispatch = jest.fn()

    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Test Title',
        content: 'Test Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: false,
        draftVersionId: 1,
        publishedVersionId: 2,
    }

    const defaultState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Title',
        content: 'Test Content',
        visibility: true,
        savedSnapshot: { title: 'Test Title', content: 'Test Content' },
        guidance: mockGuidance,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    const defaultConfig = {
        shopName: 'test-shop',
        shopType: 'shopify',
        guidanceTemplate: undefined,
        initialMode: 'edit' as const,
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
        onClose: jest.fn(),
    }

    const getStoreValue = () => {
        const contextValue = (useGuidanceContext as jest.Mock)()

        return {
            state: contextValue.state,
            config: contextValue.config,
            dispatch: contextValue.dispatch,
            guidanceArticle:
                contextValue.guidanceArticle ?? contextValue.state?.guidance,
            playground: contextValue.playground ?? ({} as any),
            setConfig: jest.fn(),
            setGuidanceArticle: jest.fn(),
            setPlayground: jest.fn(),
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
            hasDraft: true,
        })
        ;(useGuidanceStore as jest.Mock).mockImplementation((selector) =>
            selector(getStoreValue()),
        )
        ;(hasDraft as jest.Mock).mockImplementation(() => {
            const contextValue = (useGuidanceContext as jest.Mock)()
            return contextValue.hasDraft ?? false
        })
    })

    describe('isViewingDraft', () => {
        it('should return true when isCurrent is false', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(true)
        })

        it('should return false when isCurrent is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: true },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when isCurrent is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: undefined },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })

        it('should return false when viewing a historical version even if guidance is a draft', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: false },
                    historicalVersion: {
                        versionId: 10,
                        version: 5,
                        title: 'Historical Title',
                        content: 'Historical Content',
                        publishedDatetime: '2024-01-01T00:00:00Z',
                    },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isViewingDraft).toBe(false)
        })
    })

    describe('hasDraftVersion', () => {
        it('should return true when hasDraft is true', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(true)
        })

        it('should return false when hasDraft is false', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasDraftVersion).toBe(false)
        })
    })

    describe('hasPublishedVersion', () => {
        it('should return true when publishedVersionId exists', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(true)
        })

        it('should return false when publishedVersionId is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, publishedVersionId: null },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })

        it('should return false when guidance is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: undefined,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: false,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.hasPublishedVersion).toBe(false)
        })
    })

    describe('isDisabled', () => {
        it('should return false when not updating and not auto-saving', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when isAutoSaving is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isAutoSaving: true },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return true when both isUpdating and isAutoSaving are true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    isUpdating: true,
                    isAutoSaving: true,
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            expect(result.current.isDisabled).toBe(true)
        })
    })

    describe('switchVersion', () => {
        it('should call switchToVersion with "current" when viewing draft', async () => {
            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('current')
        })

        it('should call switchToVersion with "latest_draft" when viewing current', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: true },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('latest_draft')
        })

        it('should call switchToVersion with "current" when isCurrent is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: {
                    ...defaultState,
                    guidance: { ...mockGuidance, isCurrent: undefined },
                },
                dispatch: mockDispatch,
                config: defaultConfig,
                hasDraft: true,
            })

            const { result } = renderHook(() => useVersionBanner())

            await act(async () => {
                await result.current.switchVersion()
            })

            expect(mockSwitchToVersion).toHaveBeenCalledWith('current')
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useVersionBanner())

            expect(result.current).toHaveProperty('isViewingDraft')
            expect(result.current).toHaveProperty('hasDraftVersion')
            expect(result.current).toHaveProperty('hasPublishedVersion')
            expect(result.current).toHaveProperty('isDisabled')
            expect(result.current).toHaveProperty('switchVersion')
            expect(typeof result.current.switchVersion).toBe('function')
        })
    })
})
