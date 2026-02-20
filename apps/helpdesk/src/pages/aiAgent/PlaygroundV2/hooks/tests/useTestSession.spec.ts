import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useCreateTestSessionMutation } from 'models/aiAgent/queries'

import { getOfflineEvalPayloadFixture } from '../../fixtures/offlineEval.fixture'
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

    it('should call createTestSession with baseUrl when provided', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const baseUrl = 'https://test.example.com'
        const { result } = renderHook(() => useTestSession(baseUrl))

        result.current.createTestSession()

        expect(createTestSessionMock).toHaveBeenCalledWith([
            baseUrl,
            undefined,
            undefined,
        ])
    })

    it('should call createTestSession with baseUrl and payload when provided', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const baseUrl = 'https://test.example.com'
        const payload = { areActionsAllowedToExecute: true }
        const { result } = renderHook(() => useTestSession(baseUrl, payload))

        result.current.createTestSession()

        expect(createTestSessionMock).toHaveBeenCalledWith([
            baseUrl,
            payload,
            undefined,
        ])
    })

    it('should call createTestSession with undefined baseUrl and payload when only payload is provided', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const payload = { areActionsAllowedToExecute: false }
        const { result } = renderHook(() => useTestSession(undefined, payload))

        result.current.createTestSession()

        expect(createTestSessionMock).toHaveBeenCalledWith([
            undefined,
            payload,
            undefined,
        ])
    })

    it('should pass useV3 to the mutation call', () => {
        const createTestSessionMock = jest.fn()
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result } = renderHook(() =>
            useTestSession(undefined, undefined, true),
        )

        result.current.createTestSession()

        expect(createTestSessionMock).toHaveBeenCalledWith([
            undefined,
            undefined,
            true,
        ])
    })

    it('should use overridePayload instead of payload when provided', async () => {
        const defaultPayload = { areActionsAllowedToExecute: false }
        const overridePayload = getOfflineEvalPayloadFixture()
        const createTestSessionMock = jest.fn().mockResolvedValue({
            testModeSession: { id: 'session-override' },
        })
        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result } = renderHook(() =>
            useTestSession(undefined, defaultPayload),
        )

        await act(async () => {
            await result.current.createTestSession(overridePayload)
        })

        expect(createTestSessionMock).toHaveBeenCalledWith([
            undefined,
            overridePayload,
            undefined,
        ])
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

    it('should clear testSessionId when clearTestSession is called', async () => {
        const mockSessionId = 'session-to-clear'
        const createTestSessionMock = jest.fn().mockResolvedValue({
            testModeSession: { id: mockSessionId },
        })

        mockedUseCreateTestSessionMutation.mockReturnValue({
            mutateAsync: createTestSessionMock,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useCreateTestSessionMutation>)

        const { result } = renderHook(() => useTestSession())

        await act(async () => {
            await result.current.createTestSession()
        })

        expect(result.current.testSessionId).toBe(mockSessionId)

        act(() => {
            result.current.clearTestSession()
        })

        expect(result.current.testSessionId).toBeNull()
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
