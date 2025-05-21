import { act } from '@testing-library/react'

import { useCreateTestSessionMutation } from 'models/aiAgent/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useTestSession } from '../useTestSession'

jest.mock('hooks/useNotify', () => ({
    __esModule: true,
    useNotify: jest.fn(() => ({
        notify: jest.fn(),
    })),
}))
jest.mock('models/aiAgent/queries', () => ({
    useCreateTestSessionMutation: jest.fn(),
}))

const mockedUseCreateTestSessionMutation = jest.mocked(
    useCreateTestSessionMutation,
)

describe('useTestSession hook', () => {
    beforeEach(() => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should call createTestSession when onCreateTestSession is called', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result } = renderHook(() => useTestSession())

        result.current.createTestSession()

        expect(createTestSessionMock).toHaveBeenCalledTimes(1)
    })

    it('should return initial state correctly', () => {
        const { result } = renderHook(() => useTestSession())

        expect(result.current.testSessionId).toBeNull()
        expect(result.current.isTestSessionLoading).toBe(false)
    })

    it('should update sessionId when data is received', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result, rerender } = renderHook(() => useTestSession())

        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: {
                testModeSession: {
                    id: 'test-session-123',
                },
            },
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        rerender()

        expect(result.current.testSessionId).toBe('test-session-123')
    })

    it('should set testSessionId when createTestSession call is successful', async () => {
        const mockSessionId = 'new-test-session-456'
        const createTestSessionMock = jest.fn().mockResolvedValue({
            testModeSession: {
                id: mockSessionId,
            },
        })

        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result } = renderHook(() => useTestSession())

        let returnedValue: string | null = null
        await act(async () => {
            returnedValue = await result.current.createTestSession()
        })

        expect(createTestSessionMock).toHaveBeenCalledTimes(1)
        expect(returnedValue).toBe(mockSessionId)
        expect(result.current.testSessionId).toBe(mockSessionId)
    })

    it('should handle errors properly when createTestSession fails', async () => {
        const testError = new Error('Test error')
        const mockNotify = jest.fn()

        jest.mock('hooks/useNotify', () => ({
            __esModule: true,
            useNotify: jest.fn(() => ({
                notify: mockNotify,
            })),
        }))

        jest.mock('utils/errors', () => ({
            reportError: jest.fn(),
        }))

        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
            data: undefined,
            error: testError,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result, rerender } = renderHook(() => useTestSession())

        rerender()

        expect(result.current.testSessionId).toBeNull()
    })
})
