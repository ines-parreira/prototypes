import { act, renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../../../../KnowledgeHub/constants'
import { dispatchDocumentEvent } from '../../../../../KnowledgeHub/EmptyState/utils'
import type { StoreIntegrationItem } from '../../../shared/DuplicateGuidance/types'
import {
    buildDuplicateNotificationMessage,
    cleanStoreName,
} from '../../../shared/DuplicateGuidance/utils'
import { useGuidanceContext } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useDuplicateModal } from '../useDuplicateModal'

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
}))

jest.mock('../../../../../KnowledgeHub/EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
}))

jest.mock('../../../shared/DuplicateGuidance/utils', () => ({
    cleanStoreName: jest.fn((name: string) =>
        name.replace(/\s*\(current\)$/, ''),
    ),
    buildDuplicateNotificationMessage: jest.fn(() => 'Guidance duplicated'),
}))

describe('useDuplicateModal', () => {
    const mockContextDispatch = jest.fn()
    const mockAppDispatch = jest.fn()
    const mockDuplicate = jest.fn()
    const mockOnCopyFn = jest.fn()

    const defaultState: Partial<GuidanceState> = {
        guidance: {
            id: 123,
            title: 'Test Title',
            content: 'Test Content',
            locale: 'en-US',
            visibility: 'PUBLIC',
            createdDatetime: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-01T00:00:00Z',
            templateKey: null,
            isCurrent: true,
            draftVersionId: 1,
            publishedVersionId: 2,
        },
        activeModal: 'duplicate',
        isUpdating: false,
    }

    const defaultConfig = {
        shopName: 'test-shop',
        guidanceHelpCenter: { id: 1, default_locale: 'en-US' },
        onCopyFn: mockOnCopyFn,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppDispatch as unknown as jest.Mock).mockReturnValue(
            mockAppDispatch,
        )
        ;(useGuidanceArticleMutation as jest.Mock).mockReturnValue({
            duplicate: mockDuplicate,
        })
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockContextDispatch,
            config: defaultConfig,
        })
        mockAppDispatch.mockResolvedValue(undefined)
    })

    describe('isOpen', () => {
        it('should return true when activeModal is duplicate', () => {
            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockContextDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'delete' },
                dispatch: mockContextDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('isDuplicating', () => {
        it('should return false when isUpdating is false', () => {
            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.isDuplicating).toBe(false)
        })

        it('should return true when isUpdating is true', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, isUpdating: true },
                dispatch: mockContextDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.isDuplicating).toBe(true)
        })
    })

    describe('shopName', () => {
        it('should return shopName from config', () => {
            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current.shopName).toBe('test-shop')
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useDuplicateModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })
    })

    describe('onDuplicate', () => {
        const selectedStores: StoreIntegrationItem[] = [
            { id: '0', name: 'shop1' },
            { id: '1', name: 'shop2' },
        ]

        it('should early return when articleId is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, guidance: undefined },
                dispatch: mockContextDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockDuplicate).not.toHaveBeenCalled()
            expect(mockContextDispatch).not.toHaveBeenCalled()
        })

        it('should early return when selectedStores is empty', async () => {
            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate([])
            })

            expect(mockDuplicate).not.toHaveBeenCalled()
            expect(mockContextDispatch).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING true at start', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: true,
            })
        })

        it('should call duplicate with articleId and cleaned shop names', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(cleanStoreName).toHaveBeenCalledWith('shop1')
            expect(cleanStoreName).toHaveBeenCalledWith('shop2')
            expect(mockDuplicate).toHaveBeenCalledWith(
                [123],
                ['shop1', 'shop2'],
            )
        })

        it('should call onCopyFn on success', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockOnCopyFn).toHaveBeenCalled()
        })

        it('should not throw when onCopyFn is undefined', async () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockContextDispatch,
                config: { ...defaultConfig, onCopyFn: undefined },
            })
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await expect(
                act(async () => {
                    await result.current.onDuplicate(selectedStores)
                }),
            ).resolves.not.toThrow()
        })

        it('should show success notification on success', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(buildDuplicateNotificationMessage).toHaveBeenCalledWith(
                selectedStores,
                'test-shop',
            )
            expect(notify).toHaveBeenCalledWith({
                message: 'Guidance duplicated',
                status: NotificationStatus.Success,
                allowHTML: true,
                showDismissButton: true,
            })
        })

        it('should dispatch refetch event when duplicating to current store', async () => {
            mockDuplicate.mockResolvedValue(undefined)
            ;(cleanStoreName as jest.Mock).mockImplementation((name: string) =>
                name.replace(/\s*\(current\)$/, ''),
            )

            const storesWithCurrent: StoreIntegrationItem[] = [
                { id: '0', name: 'test-shop (current)' },
            ]

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(storesWithCurrent)
            })

            expect(dispatchDocumentEvent).toHaveBeenCalledWith(
                REFETCH_KNOWLEDGE_HUB_TABLE,
            )
        })

        it('should not dispatch refetch event when duplicating to other stores only', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(dispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('should show error notification on failure', async () => {
            mockDuplicate.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(notify).toHaveBeenCalledWith({
                message: 'Failed to duplicate guidance',
                status: NotificationStatus.Error,
                showDismissButton: true,
            })
        })

        it('should not call onCopyFn on failure', async () => {
            mockDuplicate.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockOnCopyFn).not.toHaveBeenCalled()
        })

        it('should dispatch SET_UPDATING false in finally block on success', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch SET_UPDATING false in finally block on error', async () => {
            mockDuplicate.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'SET_UPDATING',
                payload: false,
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on success', async () => {
            mockDuplicate.mockResolvedValue(undefined)

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })

        it('should dispatch CLOSE_MODAL in finally block on error', async () => {
            mockDuplicate.mockRejectedValue(new Error('API Error'))

            const { result } = renderHook(() => useDuplicateModal())

            await act(async () => {
                await result.current.onDuplicate(selectedStores)
            })

            expect(mockContextDispatch).toHaveBeenCalledWith({
                type: 'CLOSE_MODAL',
            })
        })
    })

    describe('useGuidanceArticleMutation initialization', () => {
        it('should pass correct guidanceHelpCenterId', () => {
            renderHook(() => useDuplicateModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 1,
            })
        })

        it('should pass 0 when guidanceHelpCenter is undefined', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: defaultState,
                dispatch: mockContextDispatch,
                config: {
                    ...defaultConfig,
                    guidanceHelpCenter: undefined,
                },
            })

            renderHook(() => useDuplicateModal())

            expect(useGuidanceArticleMutation).toHaveBeenCalledWith({
                guidanceHelpCenterId: 0,
            })
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useDuplicateModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('isDuplicating')
            expect(result.current).toHaveProperty('shopName')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDuplicate')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDuplicate).toBe('function')
        })
    })
})
