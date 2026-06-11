import { renderHook } from '@repo/testing'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
} from '@gorgias/helpdesk-mocks'

import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import {
    fetchCustomTicketsFieldsDefinitionData,
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const useCustomFieldDefinitionsMock = jest.mocked(useCustomFieldDefinitions)
const customFields = [
    { id: '1', managed_type: AI_MANAGED_TYPES.AI_OUTCOME },
    { id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT },
    { id: '3', managed_type: AI_MANAGED_TYPES.MANAGED_SENTIMENT },
] as unknown as CustomField[]
const listCustomFieldsHandler = mockListCustomFieldsHandler(async () =>
    HttpResponse.json(mockListCustomFieldsResponse({ data: customFields })),
)
const server = setupServer(listCustomFieldsHandler.handler)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useGetCustomTicketsFieldsDefinitionData', () => {
    it('should return the correct custom field IDs for outcome and intent', () => {
        const mockData = {
            data: {
                data: [
                    {
                        id: '1',
                        managed_type: AI_MANAGED_TYPES.AI_OUTCOME,
                    },
                    { id: '2', managed_type: AI_MANAGED_TYPES.AI_INTENT },
                    {
                        id: '3',
                        managed_type: AI_MANAGED_TYPES.MANAGED_SENTIMENT,
                    },
                ] as unknown as CustomField[],
            },
            isLoading: false,
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: '1',
            intentCustomFieldId: '2',
            sentimentCustomFieldId: '3',
            isLoading: false,
        })
    })

    it('should return undefined if the custom fields are not found', () => {
        const mockData = {
            data: {
                data: [
                    {
                        id: '3',
                        managed_type: 'OTHER_TYPE',
                    } as unknown as CustomField,
                ],
            },
            isLoading: false,
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
            isLoading: false,
        })
    })

    it('should handle empty data gracefully', () => {
        const mockData = {
            data: { data: [] as CustomField[] },
            isLoading: false,
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
            isLoading: false,
        })
    })

    it('should return isLoading: true while custom fields are being fetched', () => {
        const mockData = {
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useCustomFieldDefinitions>

        useCustomFieldDefinitionsMock.mockReturnValue(mockData)

        const { result } = renderHook(() =>
            useGetCustomTicketsFieldsDefinitionData(),
        )

        expect(result.current).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
            isLoading: true,
        })
    })
})

describe('fetchCustomTicketsFieldsDefinitionData', () => {
    it('should return correct IDs for all field types', async () => {
        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: '1',
            intentCustomFieldId: '2',
            sentimentCustomFieldId: '3',
        })
    })

    it('should return fallback values when fields are not found', async () => {
        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [
                            {
                                id: '3',
                                managed_type: 'OTHER_TYPE',
                            } as unknown as CustomField,
                        ],
                    }),
                ),
            ).handler,
        )

        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })

    it('should return fallback values when fields list is empty', async () => {
        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [],
                    }),
                ),
            ).handler,
        )

        const result = await fetchCustomTicketsFieldsDefinitionData()

        expect(result).toEqual({
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: null,
        })
    })

    it('should call listCustomFields with activeParams', async () => {
        const waitForListCustomFieldsRequest =
            listCustomFieldsHandler.waitForRequest(server)

        await fetchCustomTicketsFieldsDefinitionData()

        await waitForListCustomFieldsRequest(async (request) => {
            const searchParams = new URL(request.url).searchParams

            expect(Object.fromEntries(searchParams.entries())).toMatchObject(
                Object.fromEntries(
                    Object.entries(activeParams).map(([key, value]) => [
                        key,
                        String(value),
                    ]),
                ),
            )
        })
    })
})
