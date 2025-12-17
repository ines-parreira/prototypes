import { renderHook } from '@repo/testing'
import { act } from 'react-dom/test-utils'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import { useGuidanceToolbar } from './useGuidanceToolbar'

jest.mock('hooks/useNotify')
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')
jest.mock('../KnowledgeEditorGuidance/context', () => ({
    useGuidanceContext: jest.fn(),
    fromArticleTranslationResponse: jest.fn((response, extra) => ({
        ...response,
        ...extra,
    })),
}))

const mockNotifyError = jest.fn()
const mockNotifySuccess = jest.fn()
const mockDispatch = jest.fn()
const mockDuplicate = jest.fn()
const mockUpdateGuidanceArticle = jest.fn()
const mockOnCopyFn = jest.fn()
const mockOnUpdateFn = jest.fn()
const mockOnTest = jest.fn()

describe('useGuidanceToolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        jest.mocked(useNotify).mockReturnValue({
            error: mockNotifyError,
            success: mockNotifySuccess,
        } as any)

        jest.mocked(useGuidanceArticleMutation).mockReturnValue({
            duplicate: mockDuplicate,
            updateGuidanceArticle: mockUpdateGuidanceArticle,
            isGuidanceArticleUpdating: false,
        } as any)

        jest.mocked(useGuidanceContext).mockReturnValue({
            state: {
                guidance: {
                    id: 1,
                    title: 'Test Article',
                    content: 'Test Content',
                    isCurrent: true,
                },
                guidanceMode: 'read',
                title: 'Test Article',
                content: 'Test Content',
                isUpdating: false,
                isAutoSaving: false,
            },
            dispatch: mockDispatch,
            isFormValid: true,
            canEdit: true,
            config: {
                guidanceHelpCenter: {
                    id: 1,
                    default_locale: 'en-US',
                },
                onCopyFn: mockOnCopyFn,
                onUpdateFn: mockOnUpdateFn,
                onClose: jest.fn(),
                shopName: 'test-shop',
            },
            hasDraft: false,
            playground: {
                isOpen: false,
                onTest: mockOnTest,
                onClose: jest.fn(),
                sidePanelWidth: '100%',
            },
        } as any)
    })

    describe('duplicateGuidanceToShops', () => {
        it('should return success: false when articleIds is empty', async () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            const response = await act(async () => {
                return await result.current.actions.duplicateGuidanceToShops(
                    [],
                    ['shop1', 'shop2'],
                )
            })

            expect(response).toEqual({ success: false })
            expect(mockDuplicate).not.toHaveBeenCalled()
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should successfully duplicate articles and call onCopyFn', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useGuidanceToolbar())

            const response = await act(async () => {
                return await result.current.actions.duplicateGuidanceToShops(
                    [1, 2],
                    ['shop1', 'shop2'],
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDuplicate).toHaveBeenCalledWith(
                [1, 2],
                ['shop1', 'shop2'],
            )
            expect(mockOnCopyFn).toHaveBeenCalled()
            expect(response).toEqual({
                success: true,
                shopNames: ['shop1', 'shop2'],
            })
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should handle errors and return success: false', async () => {
            const error = new Error('Duplication failed')
            mockDuplicate.mockRejectedValue(error)

            const { result } = renderHook(() => useGuidanceToolbar())

            const response = await act(async () => {
                return await result.current.actions.duplicateGuidanceToShops(
                    [1],
                    ['shop1'],
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
            expect(mockDuplicate).toHaveBeenCalledWith([1], ['shop1'])
            expect(mockNotifyError).not.toHaveBeenCalled()
            expect(response).toEqual({ success: false })
            expect(mockOnCopyFn).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should not call onCopyFn when it is undefined', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: {
                        id: 1,
                        title: 'Test Article',
                        content: 'Test Content',
                        isCurrent: true,
                    },
                    guidanceMode: 'read',
                    title: 'Test Article',
                    content: 'Test Content',
                    isUpdating: false,
                    isAutoSaving: false,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: true,
                config: {
                    guidanceHelpCenter: {
                        id: 1,
                        default_locale: 'en-US',
                    },
                    onCopyFn: undefined,
                    onUpdateFn: undefined,
                    onClose: jest.fn(),
                    shopName: 'test-shop',
                },
                hasDraft: false,
                playground: {
                    isOpen: false,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                },
            } as any)

            const { result } = renderHook(() => useGuidanceToolbar())

            const response = await act(async () => {
                return await result.current.actions.duplicateGuidanceToShops(
                    [1],
                    ['shop1'],
                )
            })

            expect(mockDuplicate).toHaveBeenCalledWith([1], ['shop1'])
            expect(response).toEqual({ success: true, shopNames: ['shop1'] })
            // onCopyFn should not be called but shouldn't throw
        })

        it('should always reset updating state in finally block even on error', async () => {
            mockDuplicate.mockRejectedValue(new Error('Network error'))

            const { result } = renderHook(() => useGuidanceToolbar())

            await act(async () => {
                await result.current.actions.duplicateGuidanceToShops(
                    [1, 2, 3],
                    ['shop1', 'shop2', 'shop3'],
                )
            })

            // Verify SET_UPDATING was called with true first
            expect(mockDispatch).toHaveBeenNthCalledWith(1, {
                type: 'SET_UPDATING',
                payload: true,
            })

            // Verify SET_UPDATING was called with false in finally
            expect(mockDispatch).toHaveBeenNthCalledWith(2, {
                type: 'SET_UPDATING',
                payload: false,
            })
        })
    })

    describe('toolbar state management', () => {
        it('should return correct disabled state', () => {
            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: { id: 1 },
                    guidanceMode: 'read',
                    isUpdating: true,
                    isAutoSaving: false,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: true,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    onCopyFn: mockOnCopyFn,
                },
                hasDraft: false,
                playground: {
                    isOpen: false,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                },
            } as any)

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.isDisabled).toBe(true)
        })

        it('should return correct toolbar state for published-without-draft', () => {
            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-without-draft')
        })

        it('should return correct toolbar state for published-with-draft', () => {
            jest.mocked(useGuidanceContext).mockReturnValue({
                state: {
                    guidance: {
                        id: 1,
                        title: 'Test',
                        content: 'Content',
                        isCurrent: true,
                    },
                    guidanceMode: 'read',
                    isUpdating: false,
                    isAutoSaving: false,
                },
                dispatch: mockDispatch,
                isFormValid: true,
                canEdit: false,
                config: {
                    guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
                    onCopyFn: mockOnCopyFn,
                },
                hasDraft: true,
                playground: {
                    isOpen: false,
                    onTest: mockOnTest,
                    onClose: jest.fn(),
                    sidePanelWidth: '100%',
                },
            } as any)

            const { result } = renderHook(() => useGuidanceToolbar())

            expect(result.current.state.type).toBe('published-with-draft')
            expect(result.current.canEdit).toBe(false)
            expect(result.current.editDisabledReason).toBeDefined()
        })
    })
})
