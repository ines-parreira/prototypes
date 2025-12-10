import { renderHook } from '@testing-library/react'

import type { StoreConfiguration } from 'models/aiAgent/types'

import { usePlaygroundPrerequisites } from '../usePlaygroundPrerequisites'

jest.mock('../../../hooks/useFileIngestion')
jest.mock('../../../hooks/usePublicResources')
jest.mock('../../../hooks/useGuidanceArticles')

const mockUseFileIngestion = require('../../../hooks/useFileIngestion')
    .useFileIngestion as jest.Mock
const mockUsePublicResources = require('../../../hooks/usePublicResources')
    .usePublicResources as jest.Mock
const mockUseGuidanceArticles = require('../../../hooks/useGuidanceArticles')
    .useGuidanceArticles as jest.Mock

describe('usePlaygroundPrerequisites', () => {
    const mockStoreConfiguration: Partial<StoreConfiguration> = {
        helpCenterId: 123,
        snippetHelpCenterId: 456,
        storeName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrations: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
    })

    describe('hasPrerequisites', () => {
        it('should return true when store has help center', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return false when no help center and no snippet help center', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: undefined,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
        })

        it('should return true when has public URL sources with done status', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [
                    { id: 1, status: 'done' },
                    { id: 2, status: 'loading' },
                ],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return true when has successful external files', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [
                    { id: 1, status: 'SUCCESSFUL' },
                    { id: 2, status: 'FAILED' },
                ],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return false when loading external sources', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: true,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
        })

        it('should return false when source items are only syncing (no available sources)', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'loading' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
            expect(result.current.missingKnowledgeSource).toBe(true)
            expect(result.current.syncingMessage).toBeTruthy()
        })

        it('should return true when has available sources even if some are syncing', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [
                    { id: 1, status: 'done' },
                    { id: 2, status: 'loading' },
                ],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [
                    { id: 1, status: 'SUCCESSFUL' },
                    { id: 2, status: 'PENDING' },
                ],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
            expect(result.current.missingKnowledgeSource).toBe(false)
            expect(result.current.syncingMessage).toBeTruthy()
        })

        it('should return true when has both public URLs and external files', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'done' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [{ id: 1, status: 'SUCCESSFUL' }],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return true when has public guidance articles', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    { id: 1, visibility: 'PUBLIC', title: 'Test Article' },
                    { id: 2, visibility: 'PRIVATE', title: 'Private Article' },
                ],
                isGuidanceArticleListLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return false when only has private guidance articles', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    { id: 1, visibility: 'PRIVATE', title: 'Private Article' },
                ],
                isGuidanceArticleListLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
        })

        it('should return false when loading guidance articles', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    { id: 1, visibility: 'PUBLIC', title: 'Test Article' },
                ],
                isGuidanceArticleListLoading: true,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
        })

        it('should return true when has any combination of sources with public guidance', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'done' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [{ id: 1, status: 'SUCCESSFUL' }],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    { id: 1, visibility: 'PUBLIC', title: 'Test Article' },
                ],
                isGuidanceArticleListLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should return true when help center exists even if external sources are only syncing', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'loading' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [{ id: 1, status: 'PENDING' }],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
            expect(result.current.missingKnowledgeSource).toBe(false)
            expect(result.current.syncingMessage).toBeTruthy()
        })

        it('should return true when guidance articles exist even if external sources are only syncing', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'loading' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [{ id: 1, status: 'PENDING' }],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [
                    { id: 1, visibility: 'PUBLIC', title: 'Test Article' },
                ],
                isGuidanceArticleListLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
            expect(result.current.missingKnowledgeSource).toBe(false)
            expect(result.current.syncingMessage).toBeTruthy()
        })
    })

    describe('missingKnowledgeSource', () => {
        it('should return false when store has help center', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.missingKnowledgeSource).toBe(false)
        })

        it('should return true when no snippet help center ID', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: undefined,
                }),
            )

            expect(result.current.missingKnowledgeSource).toBe(true)
        })

        it('should return false when has prerequisites', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'done' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.missingKnowledgeSource).toBe(false)
        })

        it('should return false when still loading', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: true,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.missingKnowledgeSource).toBe(false)
        })

        it('should return true when no prerequisites and not loading', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.missingKnowledgeSource).toBe(true)
        })
    })

    describe('isCheckingPrerequisites', () => {
        it('should return false when store has help center', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(false)
        })

        it('should return false when no snippet help center', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: undefined,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(false)
        })

        it('should return true when loading source items', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: true,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(true)
        })

        it('should return true when loading external files', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: true,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(true)
        })

        it('should return true when loading guidance articles', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: true,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                        guidanceHelpCenterId: 789,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(true)
        })

        it('should return false when done loading', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'done' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.isCheckingPrerequisites).toBe(false)
        })
    })

    describe('edge cases', () => {
        it('should handle undefined storeConfiguration', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: undefined,
                    snippetHelpCenterId: undefined,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(false)
            expect(result.current.missingKnowledgeSource).toBe(true)
            expect(result.current.isCheckingPrerequisites).toBe(false)
        })

        it('should handle null help center ID', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [{ id: 1, status: 'done' }],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        helpCenterId: null,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(result.current.hasPrerequisites).toBe(true)
        })

        it('should use snippetHelpCenterId when calling hooks', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: 789,
                }),
            )

            expect(mockUsePublicResources).toHaveBeenCalledWith(
                expect.objectContaining({
                    helpCenterId: 789,
                }),
            )
            expect(mockUseFileIngestion).toHaveBeenCalledWith(
                expect.objectContaining({
                    helpCenterId: 789,
                }),
            )
        })

        it('should use 0 as default when no snippetHelpCenterId', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: mockStoreConfiguration as any,
                    snippetHelpCenterId: undefined,
                }),
            )

            expect(mockUsePublicResources).toHaveBeenCalledWith(
                expect.objectContaining({
                    helpCenterId: 0,
                }),
            )
            expect(mockUseFileIngestion).toHaveBeenCalledWith(
                expect.objectContaining({
                    helpCenterId: 0,
                }),
            )
        })

        it('should call useGuidanceArticles with guidanceHelpCenterId', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
            })

            renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        guidanceHelpCenterId: 999,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(mockUseGuidanceArticles).toHaveBeenCalledWith(999, {
                enabled: true,
            })
        })

        it('should call useGuidanceArticles with 0 when no guidanceHelpCenterId', () => {
            mockUsePublicResources.mockReturnValue({
                sourceItems: [],
                isSourceItemsListLoading: false,
            })
            mockUseFileIngestion.mockReturnValue({
                ingestedFiles: [],
                isLoading: false,
            })
            mockUseGuidanceArticles.mockReturnValue({
                guidanceArticles: [],
                isGuidanceArticleListLoading: false,
            })

            renderHook(() =>
                usePlaygroundPrerequisites({
                    storeConfiguration: {
                        ...mockStoreConfiguration,
                        guidanceHelpCenterId: undefined,
                    } as any,
                    snippetHelpCenterId: 456,
                }),
            )

            expect(mockUseGuidanceArticles).toHaveBeenCalledWith(0, {
                enabled: false,
            })
        })
    })
})
