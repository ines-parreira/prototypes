import { renderHook } from '@testing-library/react'

import { StoreConfiguration } from 'models/aiAgent/types'

import { usePlaygroundPrerequisites } from '../usePlaygroundPrerequisites'

jest.mock('../../../hooks/useFileIngestion')
jest.mock('../../../hooks/usePublicResources')

const mockUseFileIngestion = require('../../../hooks/useFileIngestion')
    .useFileIngestion as jest.Mock
const mockUsePublicResources = require('../../../hooks/usePublicResources')
    .usePublicResources as jest.Mock

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

        it('should return false when all source items are loading', () => {
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
    })
})
