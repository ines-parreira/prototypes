import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import intercomSchema from 'pages/standalone/assets/httpSchemas/ticket-intercom.json'
import zendeskSchema from 'pages/standalone/assets/httpSchemas/ticket-zendesk.json'
import {
    HANDOVER_DEFAULT_CONTENT_TYPE,
    HANDOVER_DEFAULT_METHOD,
    HANDOVER_INTEGRATION_NAME_PREFIX,
    TICKET_HANDOVER_TRIGGER,
} from 'pages/standalone/constants'
import { useStandaloneIntegrationUpsert } from 'pages/standalone/hooks/useStandaloneIntegrationUpsert'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationById } from 'state/integrations/selectors'
import { renderHook } from 'utils/testing/renderHook'

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))
jest.mock('state/integrations/selectors', () => ({
    getIntegrationById: jest.fn(() => () => null),
}))

const useAppSelectorMock = useAppSelector as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const updateOrCreateIntegrationMock = updateOrCreateIntegration as jest.Mock
const getIntegrationByIdMock = getIntegrationById as jest.Mock

describe('useStandaloneIntegrationCreate', () => {
    const mockDispatch = jest.fn((action) => action)

    beforeEach(() => {
        jest.clearAllMocks()
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    it('should return a create function', () => {
        // Mock the selector to return null (no existing integration)
        useAppSelectorMock.mockReturnValue(null)

        const onCreateSuccess = jest.fn()
        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(
                null,
                { subdomain: 'test-domain', basicAuth: 'test-auth' },
                onCreateSuccess,
            ),
        )

        expect(result.current).toHaveProperty('upsert')
        expect(typeof result.current.upsert).toBe('function')
    })

    it('should create a new Zendesk integration', () => {
        // Mock the selector to return null (no existing integration)
        useAppSelectorMock.mockReturnValue(null)

        const onCreateSuccess = jest.fn()

        // Mock the updateOrCreateIntegration to call the callback with success
        updateOrCreateIntegrationMock.mockImplementation(
            (_, __, ___, callback) => {
                callback({
                    ok: true,
                    id: 123,
                })
            },
        )

        // Setup test values
        const testSubdomain = 'test-domain'
        const testBasicToken = 'test-auth'

        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(
                null,
                { subdomain: testSubdomain, basicToken: testBasicToken },
                onCreateSuccess,
            ),
        ) // Call the create function
        result.current.upsert(HelpdeskIntegrationOptions.ZENDESK)

        // Verify updateOrCreateIntegration was called with correct params
        expect(updateOrCreateIntegrationMock).toHaveBeenCalledWith(
            expect.any(Object), // fromJS object
            undefined,
            true,
            expect.any(Function),
        )

        // Get the first argument (the integration object)
        const callArg = updateOrCreateIntegrationMock.mock.calls[0][0]

        // Check the integration properties
        expect(callArg.get('name')).toBe(
            `${HANDOVER_INTEGRATION_NAME_PREFIX}${HelpdeskIntegrationOptions.ZENDESK}`,
        )
        expect(callArg.get('type')).toBe(IntegrationType.Http)
        expect(callArg.get('managed')).toBe(true)
        expect(callArg.get('description')).toBe(
            `Integration for ${HelpdeskIntegrationOptions.ZENDESK} handover`,
        )

        // Check HTTP properties
        const http = callArg.get('http')

        // Check URL with templated values replaced
        const expectedUrl = zendeskSchema.url.replace(
            '{{subdomain}}',
            testSubdomain,
        )
        expect(http.get('url')).toBe(expectedUrl)

        // Check headers based on actual schema
        const expectedHeaders = { ...zendeskSchema.headers }
        expectedHeaders.Authorization = 'Basic test-auth' // Authorization is replaced with the value
        expect(http.get('headers')).toEqual(fromJS(expectedHeaders))

        expect(http.get('request_content_type')).toBe(
            HANDOVER_DEFAULT_CONTENT_TYPE,
        )
        expect(http.get('response_content_type')).toBe(
            HANDOVER_DEFAULT_CONTENT_TYPE,
        )
        expect(http.get('method')).toBe(HANDOVER_DEFAULT_METHOD)
        expect(http.get('triggers').get(TICKET_HANDOVER_TRIGGER)).toBe(true)

        // Check form body from the schema
        expect(http.get('form')).toEqual(fromJS(zendeskSchema.body))

        // Verify onCreateSuccess was called with correct ID
        expect(onCreateSuccess).toHaveBeenCalledWith(123)
    })

    it('should create a new Intercom integration', () => {
        // Mock the selector to return null (no existing integration)
        useAppSelectorMock.mockReturnValue(null)

        const onCreateSuccess = jest.fn()

        // Mock the updateOrCreateIntegration to call the callback with success
        updateOrCreateIntegrationMock.mockImplementation(
            (data, _, __, callback) => {
                callback({
                    ok: true,
                    id: 456,
                })
            },
        )

        // Setup test values
        const testAccessToken = 'test-token'

        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(
                null,
                { accessToken: testAccessToken },
                onCreateSuccess,
            ),
        )

        // Call the create function
        result.current.upsert(HelpdeskIntegrationOptions.INTERCOM)

        // Get the first argument (the integration object)
        const callArg = updateOrCreateIntegrationMock.mock.calls[0][0]

        // Check integration properties
        expect(callArg.get('name')).toBe(
            `${HANDOVER_INTEGRATION_NAME_PREFIX}${HelpdeskIntegrationOptions.INTERCOM}`,
        )
        expect(callArg.get('type')).toBe(IntegrationType.Http)
        expect(callArg.get('managed')).toBe(true)

        // Check HTTP properties for Intercom
        const http = callArg.get('http')

        // Check URL
        expect(http.get('url')).toBe(intercomSchema.url)

        // Check headers based on actual schema
        const expectedHeaders = { ...intercomSchema.headers }
        expectedHeaders.Authorization = 'Bearer test-token' // Authorization is replaced with the value
        expect(http.get('headers')).toEqual(fromJS(expectedHeaders))

        expect(http.get('request_content_type')).toBe(
            HANDOVER_DEFAULT_CONTENT_TYPE,
        )
        expect(http.get('response_content_type')).toBe(
            HANDOVER_DEFAULT_CONTENT_TYPE,
        )
        expect(http.get('method')).toBe(HANDOVER_DEFAULT_METHOD)
        expect(http.get('triggers').get(TICKET_HANDOVER_TRIGGER)).toBe(true)

        // Check form body from the schema
        expect(http.get('form')).toEqual(fromJS(intercomSchema.body))

        // Verify onCreateSuccess was called with correct ID
        expect(onCreateSuccess).toHaveBeenCalledWith(456)
    })

    it('should update an existing integration', () => {
        // Create a mock integration with ID
        const mockIntegration = fromJS({
            id: 789,
            name: 'Old Integration Name',
            // Other properties...
        })

        // Mock the selector to return the existing integration
        const selectorFn = jest.fn().mockReturnValue(mockIntegration)
        getIntegrationByIdMock.mockReturnValue(selectorFn)
        useAppSelectorMock.mockImplementation((fn) => fn())

        const onCreateSuccess = jest.fn()

        // Mock the updateOrCreateIntegration to call the callback with success
        updateOrCreateIntegrationMock.mockImplementation(
            (data, _, __, callback) => {
                callback({
                    ok: true,
                    id: 789,
                })
            },
        )

        // Setup test values
        const testSubdomain = 'updated-domain'
        const testBasicToken = 'updated-auth'

        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(
                789,
                { subdomain: testSubdomain, basicToken: testBasicToken },
                onCreateSuccess,
            ),
        )

        // Call the create function
        result.current.upsert(HelpdeskIntegrationOptions.ZENDESK)

        // Get the first argument (the integration object)
        const callArg = updateOrCreateIntegrationMock.mock.calls[0][0]

        // Check that it includes the ID of the existing integration
        expect(callArg.get('id')).toBe(789)

        // Check the integration properties
        expect(callArg.get('name')).toBe(
            `${HANDOVER_INTEGRATION_NAME_PREFIX}${HelpdeskIntegrationOptions.ZENDESK}`,
        )
        expect(callArg.get('type')).toBe(IntegrationType.Http)
        expect(callArg.get('managed')).toBe(true)

        // Verify HTTP properties were updated
        const http = callArg.get('http')

        // Check URL with templated values replaced
        const expectedUrl = zendeskSchema.url.replace(
            '{{subdomain}}',
            testSubdomain,
        )
        expect(http.get('url')).toBe(expectedUrl)

        // Check headers based on actual schema
        const expectedHeaders = { ...zendeskSchema.headers }
        expectedHeaders.Authorization = 'Basic updated-auth' // Use the value of testBasicToken // Authorization is replaced with the value
        expect(http.get('headers')).toEqual(fromJS(expectedHeaders))

        // Check form body from the schema
        expect(http.get('form')).toEqual(fromJS(zendeskSchema.body))

        // Verify onCreateSuccess was called with correct ID
        expect(onCreateSuccess).toHaveBeenCalledWith(789)
    })

    it('should handle API error', () => {
        // Mock the selector to return null (no existing integration)
        useAppSelectorMock.mockReturnValue(null)

        const onCreateSuccess = jest.fn()

        // Mock console.error
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        // Mock the updateOrCreateIntegration to call the callback with an error
        updateOrCreateIntegrationMock.mockImplementation(
            (data, _, __, callback) => {
                callback({
                    ok: false,
                    error: 'Something went wrong',
                })
            },
        )

        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(
                null,
                { subdomain: 'test-domain', basicToken: 'test-auth' },
                onCreateSuccess,
            ),
        )

        // Call the create function
        result.current.upsert(HelpdeskIntegrationOptions.ZENDESK)

        // Verify updateOrCreateIntegration was called
        expect(updateOrCreateIntegrationMock).toHaveBeenCalled()

        // Get the first argument (the integration object)
        var callArg = updateOrCreateIntegrationMock.mock.calls[0][0]

        // Basic check that we have the right structure
        expect(callArg.get('http').get('url')).toBe(
            'https://test-domain.zendesk.com/api/v2/tickets',
        )

        // Verify updateOrCreateIntegration was called
        expect(updateOrCreateIntegrationMock).toHaveBeenCalled()

        // Get the first argument (the integration object)
        callArg = updateOrCreateIntegrationMock.mock.calls[0][0]

        // Basic check that we have the right structure
        expect(callArg.get('http').get('url')).toBe(
            'https://test-domain.zendesk.com/api/v2/tickets',
        )

        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to create integration: Something went wrong',
        )

        // Verify onCreateSuccess was not called
        expect(onCreateSuccess).not.toHaveBeenCalled()

        // Restore console.error
        consoleErrorSpy.mockRestore()
    })

    it('should return early if target integration is not supported', () => {
        // Mock the selector to return null (no existing integration)
        useAppSelectorMock.mockReturnValue(null)

        const onCreateSuccess = jest.fn()

        const { result } = renderHook(() =>
            useStandaloneIntegrationUpsert(null, {}, onCreateSuccess),
        )

        // Call the create function
        result.current.upsert('unsupported-integration')

        // Verify updateOrCreateIntegration was not called
        expect(updateOrCreateIntegrationMock).not.toHaveBeenCalled()

        // Verify onCreateSuccess was not called
        expect(onCreateSuccess).not.toHaveBeenCalled()
    })

    describe('currentIntegrationType', () => {
        it('should return ZENDESK as default when no integration exists', () => {
            // Mock the selector to return null (no existing integration)
            useAppSelectorMock.mockReturnValue(null)

            const onCreateSuccess = jest.fn()
            const { result } = renderHook(() =>
                useStandaloneIntegrationUpsert(null, {}, onCreateSuccess),
            )

            // Check the default value of currentIntegrationType
            expect(result.current.currentIntegrationType).toBe(
                HelpdeskIntegrationOptions.ZENDESK,
            )
        })

        it('should extract integration type from integration name when it exists', () => {
            // Create a mock integration with a valid handover integration name
            const mockIntegration = fromJS({
                id: 123,
                name: `${HANDOVER_INTEGRATION_NAME_PREFIX}${HelpdeskIntegrationOptions.INTERCOM}`,
            })

            // Mock the selector to return the existing integration
            const selectorFn = jest.fn().mockReturnValue(mockIntegration)
            getIntegrationByIdMock.mockReturnValue(selectorFn)
            useAppSelectorMock.mockImplementation((fn) => fn())

            const onCreateSuccess = jest.fn()
            const { result } = renderHook(() =>
                useStandaloneIntegrationUpsert(123, {}, onCreateSuccess),
            )

            // Check that it correctly extracts the INTERCOM part from the name
            expect(result.current.currentIntegrationType).toBe(
                HelpdeskIntegrationOptions.INTERCOM,
            )
        })

        it('should handle integration with non-standard name format', () => {
            // Create a mock integration with a non-standard name (without prefix)
            const mockIntegration = fromJS({
                id: 456,
                name: 'Some Random Integration',
            })

            // Mock the selector to return the existing integration
            const selectorFn = jest.fn().mockReturnValue(mockIntegration)
            getIntegrationByIdMock.mockReturnValue(selectorFn)
            useAppSelectorMock.mockImplementation((fn) => fn())

            const onCreateSuccess = jest.fn()
            const { result } = renderHook(() =>
                useStandaloneIntegrationUpsert(456, {}, onCreateSuccess),
            )

            // Should return the default ZENDESK value if name doesn't match expected format
            expect(result.current.currentIntegrationType).toBe(
                HelpdeskIntegrationOptions.ZENDESK,
            )
        })

        it('should handle integration with empty name', () => {
            // Create a mock integration with empty name
            const mockIntegration = fromJS({
                id: 789,
                name: '',
            })

            // Mock the selector to return the existing integration
            const selectorFn = jest.fn().mockReturnValue(mockIntegration)
            getIntegrationByIdMock.mockReturnValue(selectorFn)
            useAppSelectorMock.mockImplementation((fn) => fn())

            const onCreateSuccess = jest.fn()
            const { result } = renderHook(() =>
                useStandaloneIntegrationUpsert(789, {}, onCreateSuccess),
            )

            // Should return the default ZENDESK value if name is empty
            expect(result.current.currentIntegrationType).toBe(
                HelpdeskIntegrationOptions.ZENDESK,
            )
        })
    })
})
