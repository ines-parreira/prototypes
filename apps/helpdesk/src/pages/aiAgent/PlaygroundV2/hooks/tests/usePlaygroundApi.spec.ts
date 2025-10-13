import { renderHook } from '@repo/testing'

import { useSubmitPlaygroundTicket } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import {
    DEFAULT_PLAYGROUND_CUSTOMER,
    PLAYGROUND_CUSTOMER_MOCK,
} from 'pages/aiAgent/constants'
import { playgroundCustomerMessage } from 'pages/aiAgent/fixtures/playgroundMessages.fixture'

import { getTicketCustomer } from '../../utils/playground-ticket.util'
import { usePlaygroundApi } from '../usePlaygroundApi'

// Mock dependencies
jest.mock('models/aiAgent/queries', () => ({
    useSubmitPlaygroundTicket: jest.fn(),
}))

jest.mock('../../utils/playground-ticket.util', () => ({
    getTicketCustomer: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

const mockSubmitPlaygroundTicket = jest.fn()
const mockedUseSubmitPlaygroundTicket = jest.mocked(useSubmitPlaygroundTicket)
const mockedGetTicketCustomer = jest.mocked(getTicketCustomer)

let abortControllerMock = jest.fn()

const defaultParams = {
    gorgiasDomain: 'acme',
    accountId: 123,
    httpIntegrationId: 456,
    channelIntegrationId: 789,
    isNewAgenticArchitectureEnabled: false,
}

describe('usePlaygroundApi', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: mockSubmitPlaygroundTicket,
            isLoading: false,
        } as any)

        mockSubmitPlaygroundTicket.mockResolvedValue({
            data: { _action_serialized_state: 'serialized_state_value' },
        })

        mockedGetTicketCustomer.mockResolvedValue(PLAYGROUND_CUSTOMER_MOCK)

        // Mock AbortController
        global.AbortController = jest.fn().mockImplementation(() => ({
            abort: abortControllerMock,
            signal: {},
        }))
    })

    const defaultProps = {
        ...defaultParams,
        storeData: { storeName: 'Test Store' } as StoreConfiguration,
    }

    it('should initialize and return expected functions', () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        expect(result.current).toHaveProperty('submitMessage')
        expect(result.current).toHaveProperty('isSubmitting')
        expect(result.current).toHaveProperty('abortCurrentRequest')
        expect(typeof result.current.submitMessage).toBe('function')
        expect(typeof result.current.abortCurrentRequest).toBe('function')
    })

    it('should abort ongoing request when abortCurrentRequest is called', async () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            subject: 'Test Subject',
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            channelAvailability: undefined,
            testSessionId: null,
            createTestSession: jest.fn(),
        })

        result.current.abortCurrentRequest()

        expect(abortControllerMock).toHaveBeenCalled()
    })

    it('should submit message and return response', async () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        const response = await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            subject: 'Test Subject',
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            channelAvailability: undefined,
            testSessionId: null,
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalled()
        expect(response).toEqual({
            _action_serialized_state: 'serialized_state_value',
        })
    })

    it('should use mock customer when getTicketCustomer fails', async () => {
        mockedGetTicketCustomer.mockRejectedValue(
            new Error('Failed to get customer'),
        )

        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.objectContaining({
                customer: PLAYGROUND_CUSTOMER_MOCK,
            }),
            '',
            expect.any(Object),
        ])
    })

    it('should create new test session when isNewAgenticArchitectureEnabled is true and it is the first customer message', async () => {
        const createTestSession = jest.fn().mockResolvedValue('new-session-id')

        const { result } = renderHook(() =>
            usePlaygroundApi({
                ...defaultProps,
                isNewAgenticArchitectureEnabled: true,
            }),
        )

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: 'existing-session-id',
            createTestSession,
        })

        expect(createTestSession).toHaveBeenCalled()
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.any(Object),
            'new-session-id',
            expect.any(Object),
        ])
    })

    it('should use existing test session when not the first customer message', async () => {
        const createTestSession = jest.fn().mockResolvedValue('new-session-id')

        const { result } = renderHook(() =>
            usePlaygroundApi({
                ...defaultProps,
                isNewAgenticArchitectureEnabled: true,
            }),
        )

        // Create a conversation with both AI and customer messages
        const messages = [
            playgroundCustomerMessage, // Customer message
            playgroundCustomerMessage, // Customer message
        ]

        await result.current.submitMessage({
            messages,
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: 'existing-session-id',
            createTestSession,
        })

        expect(createTestSession).not.toHaveBeenCalled()
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.any(Object),
            'existing-session-id',
            expect.any(Object),
        ])
    })

    it('should store action serialized state from response', async () => {
        mockSubmitPlaygroundTicket.mockResolvedValue({
            data: { _action_serialized_state: 'updated_state_value' },
        })

        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        // Verify first call
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalled()

        // Send another message to see if state is preserved
        mockSubmitPlaygroundTicket.mockClear()
        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        // Check that the second call includes the serialized state from first response
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.objectContaining({
                _action_serialized_state: 'updated_state_value',
            }),
            '',
            expect.any(Object),
        ])
    })
})
