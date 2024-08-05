import {getGorgiasChatProtectedApiClient} from 'rest_api/gorgias_chat_protected_api/client'
import {
    fetchChatsApplicationAutomationSettings,
    fetchChatApplicationAutomationSettings,
    upsertChatApplicationAutomationSettings,
} from '../resources'

// Mocking the API client
jest.mock('rest_api/gorgias_chat_protected_api/client')

const mockedGetGorgiasChatProtectedApiClient =
    getGorgiasChatProtectedApiClient as jest.MockedFunction<
        typeof getGorgiasChatProtectedApiClient
    >

describe('resources.ts', () => {
    describe('fetchChatApplicationAutomationSettings', () => {
        it('should fetch automation settings for a given application ID', async () => {
            const mockResponse = {
                data: {
                    articleRecommendation: true,
                    quickResponses: true,
                    orderManagement: true,
                    workflows: [],
                },
            }
            const mockClient = {
                getApplicationAutomationSettings: jest
                    .fn()
                    .mockResolvedValue(mockResponse),
            }
            mockedGetGorgiasChatProtectedApiClient.mockResolvedValue(
                mockClient as any
            )

            const result = await fetchChatApplicationAutomationSettings(
                'app_id_123'
            )

            expect(
                mockedGetGorgiasChatProtectedApiClient
            ).toHaveBeenCalledTimes(1)
            expect(
                mockClient.getApplicationAutomationSettings
            ).toHaveBeenCalledWith({applicationId: 'app_id_123'})
            expect(result).toEqual(mockResponse.data)
        })
    })

    describe('fetchChatsApplicationAutomationSettings', () => {
        it('should fetch automation settings for multiple application IDs', async () => {
            const mockResponse = {
                data: {
                    articleRecommendation: true,
                    quickResponses: true,
                    orderManagement: true,
                    workflows: [],
                },
            }
            const mockClient = {
                getApplicationAutomationSettings: jest
                    .fn()
                    .mockResolvedValue(mockResponse),
            }
            mockedGetGorgiasChatProtectedApiClient.mockResolvedValue(
                mockClient as any
            )

            const applicationIds = ['app_id_123', 'app_id_456']
            const result = await fetchChatsApplicationAutomationSettings(
                applicationIds
            )

            expect(
                mockedGetGorgiasChatProtectedApiClient
            ).toHaveBeenCalledTimes(2)
            expect(result).toEqual([mockResponse.data, mockResponse.data])
        })
    })

    describe('upsertChatApplicationAutomationSettings', () => {
        it('should upsert automation settings for a given application ID', async () => {
            const mockResponse = {
                data: {
                    articleRecommendation: true,
                    quickResponses: true,
                    orderManagement: true,
                    workflows: [],
                },
            }
            const mockClient = {
                upsertApplicationAutomationSettings: jest
                    .fn()
                    .mockResolvedValue(mockResponse),
            }
            mockedGetGorgiasChatProtectedApiClient.mockResolvedValue(
                mockClient as any
            )

            const payload: any = {
                articleRecommendation: true,
                quickResponses: true,
                orderManagement: true,
                workflows: [],
            }
            const result = await upsertChatApplicationAutomationSettings(
                'app_id_123',
                payload
            )

            expect(
                mockedGetGorgiasChatProtectedApiClient
            ).toHaveBeenCalledTimes(1)
            expect(
                mockClient.upsertApplicationAutomationSettings
            ).toHaveBeenCalledWith({applicationId: 'app_id_123'}, payload)
            expect(result).toEqual(mockResponse.data)
        })
    })
})
