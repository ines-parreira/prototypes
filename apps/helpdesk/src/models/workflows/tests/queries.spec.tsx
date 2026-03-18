import { act, waitFor } from '@testing-library/react'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'
import type { Paths } from 'rest_api/workflows_api/client.generated'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import type { TrackstarConnection } from '../../../pages/automate/workflows/types'
import {
    fetchWorkflowConfigurations,
    useCreateTrackstarLink,
    useCreateTrackstarToken,
    useDeleteWorkflowConfigurationTemplate,
    useGetActionsApp,
    useGetConfigurationExecution,
    useGetConfigurationExecutionLogs,
    useGetConfigurationExecutions,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
    useListTrackstarConnections,
    useUpsertActionsApp,
} from '../queries'

const mockedServer = new MockAdapter(axios)

describe('queries', () => {
    beforeAll(async () => {
        await getGorgiasWfApiClient()
    })

    beforeEach(() => {
        mockedServer.reset()
    })

    describe('useListActionsApps()', () => {
        it('should return Actions apps on success', async () => {
            const actionsApps: Awaited<Paths.AppControllerList.Responses.$200> =
                [
                    {
                        id: 'someid',
                        auth_type: 'api-key',
                        auth_settings: {
                            url: 'https://www.example.com',
                        },
                    },
                ]

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/apps/)
                .reply(200, actionsApps)

            const { result } = renderHookWithQueryClientProvider(() =>
                useListActionsApps(),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(actionsApps)
        })
    })

    describe('useGetActionsApp()', () => {
        it('should return Actions app on success', async () => {
            const actionsApp: Awaited<Paths.AppControllerGet.Responses.$200> = {
                id: 'someid',
                auth_type: 'api-key',
                auth_settings: {
                    url: 'https://www.example.com',
                },
            }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/apps\/\w+/)
                .reply(200, actionsApp)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetActionsApp(actionsApp.id),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(actionsApp)
        })

        it('should not call API if id is missing', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useGetActionsApp(),
            )

            expect(mockedServer.history.get.length).toEqual(0)
            expect(result.current.data).toBeUndefined()
        })
    })

    describe('useUpsertActionsApp()', () => {
        it('should upsert & return Actions app on success', async () => {
            const actionsApp: Awaited<Paths.AppControllerGet.Responses.$200> = {
                id: 'someid',
                auth_type: 'api-key',
                auth_settings: {
                    url: 'https://www.example.com',
                },
            }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onPut(/apps\/\w+/)
                .reply(200, actionsApp)

            const { result } = renderHookWithQueryClientProvider(() =>
                useUpsertActionsApp(),
            )

            act(() => {
                result.current.mutate([{ id: actionsApp.id }, actionsApp])
            })

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data?.data).toEqual(actionsApp)
        })
    })

    describe('useGetConfigurationExecutions()', () => {
        it('should get configuration executions paginated data', async () => {
            const executionsResponse: Awaited<Paths.WfConfigurationControllerGetExecutions.Responses.$200> =
                {
                    data: [],
                    meta: {
                        pagination: {
                            current_page: 1,
                            page_limit: 15,
                            page_size: 0,
                            total_pages: 0,
                            total_size: 0,
                            next_page: null,
                        },
                    },
                }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations\/\w+\/executions/)
                .reply(200, executionsResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutions({
                    configurationInternalId: 'someid',
                    from: new Date(),
                    orderBy: 'ASC',
                    page: 1,
                    to: new Date(),
                    status: ['success'],
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(executionsResponse)
        })
    })

    describe('useGetConfigurationExecution()', () => {
        it('should get configuration execution data', async () => {
            const executionsResponse: Awaited<Paths.WfConfigurationControllerGetExecution.Responses.$200> =
                {
                    channel_actions: [],
                    id: 'someid',
                    awaited_callbacks: [],
                    configuration_id: 'someid',
                    configuration_internal_id: 'someid',
                    current_step_id: 'someid',
                    state: {
                        trigger: 'llm-prompt',
                    },
                }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations\/\w+\/executions\/\w+/)
                .reply(200, executionsResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecution('configurationId', 'executionId'),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(executionsResponse)
        })
    })

    describe('useGetConfigurationExecutionLogs()', () => {
        it('should get configuration execution HTTP logs data', async () => {
            const executionLogsResponse: Awaited<Paths.WfConfigurationControllerExportExecutionLogs.Responses.$200> =
                [
                    {
                        id: 'someid',
                        request_datetime: '2021-09-01T00:00:00Z',
                        request_method: 'GET',
                        request_url: 'https://www.example.com',
                        step_id: 'step-id',
                        response_status_code: 200,
                    },
                ]

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations\/\w+\/executions\/\w+/)
                .reply(200, executionLogsResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutionLogs(
                    'configurationId',
                    'executionId',
                ),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(executionLogsResponse)
        })

        it('should return empty if data not found', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations\/\w+\/executions\/\w+/)
                .reply(404)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutionLogs(
                    'configurationId',
                    'executionId',
                ),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual([])
        })
    })

    describe('useDeleteWorkflowConfigurationTemplate()', () => {
        it('should delete workflow configuration template on success', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onDelete(/configuration-templates\/\w+/)
                .reply(204)

            const { result } = renderHookWithQueryClientProvider(() =>
                useDeleteWorkflowConfigurationTemplate(),
            )

            act(() => {
                result.current.mutate([{ internal_id: 'someid' }])
            })

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
        })
    })

    describe('useGetWorkflowConfigurationTemplates()', () => {
        it('should return workflow configuration templates on success', async () => {
            const templatesResponse = {
                data: [
                    {
                        id: 'uuid1',
                    },
                ],
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplates
            >

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/configuration-templates/)
                .reply(200, templatesResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetWorkflowConfigurationTemplates({
                    triggers: ['llm-prompt', 'reusable-llm-prompt'],
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(templatesResponse)
        })
    })

    describe('fetchWorkflowConfigurations()', () => {
        it('should return workflow configurations on success', async () => {
            const configurationsResponse = [
                {
                    id: 'uuid1',
                    internal_id: 'flow-seed-1',
                    name: 'Test flow',
                },
            ]

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations/)
                .reply(200, configurationsResponse)

            const result = await fetchWorkflowConfigurations()

            expect(result).toEqual(configurationsResponse)
        })

        it('should include drafts when includeDrafts is true', async () => {
            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/configurations/)
                .reply(function (config) {
                    expect(config.params.is_draft).toEqual(['0', '1'])
                    return [200, []]
                })

            await fetchWorkflowConfigurations(true)
        })
    })

    describe('useListTrackstarConnections()', () => {
        it('should return trackstar connections on success', async () => {
            const trackstarConnections: TrackstarConnection[] = [
                {
                    connection_id: 'trackstar-id',
                    store_name: 'test-store',
                    store_type: 'shopify',
                    account_id: 1,
                    integration_name: 'sandbox',
                    error: false,
                },
            ]

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/trackstar/)
                .reply(200, trackstarConnections)

            const { result } = renderHookWithQueryClientProvider(() =>
                useListTrackstarConnections({
                    storeName: 'test-store',
                    storeType: 'shopify',
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(trackstarConnections)
        })
    })

    describe('useCreateTrackstarLink()', () => {
        it('should create trackstar link on success', async () => {
            const linkResponse: Paths.TrackstarControllerLink.Responses.$200 = {
                link_token: 'link_token',
            }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onPost(/trackstar\/link/)
                .reply(200, linkResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useCreateTrackstarLink(),
            )

            act(() => {
                result.current.mutate([
                    {
                        connection_id: 'trackstar-id',
                    },
                ])
            })

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data?.data).toEqual(linkResponse)
        })
    })

    describe('useCreateTrackstarToken()', () => {
        it('should create trackstar token on success', async () => {
            const tokenResponse: Paths.TrackstarControllerToken.Responses.$201 =
                {
                    connection_id: 'connection_id',
                    error: false,
                }

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onPost(/trackstar\/token/)
                .reply(200, tokenResponse)

            const { result } = renderHookWithQueryClientProvider(() =>
                useCreateTrackstarToken(),
            )

            act(() => {
                result.current.mutate([
                    {
                        store_name: 'test-store',
                        store_type: 'shopify',
                        token: 'authorization-code',
                    },
                ])
            })

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data?.data).toEqual(tokenResponse)
        })
    })

    describe('useGetStoreWorkflowsConfigurations()', () => {
        it('should handle enabled parameter correctly when it is true', async () => {
            const mockResponse: any[] = []

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/stores\/.*\/.*\/configurations/)
                .reply(function (config) {
                    expect(config.params.enabled).toBe('true')
                    return [200, mockResponse]
                })

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetStoreWorkflowsConfigurations({
                    storeName: 'test-store',
                    storeType: 'shopify',
                    triggers: ['llm-prompt'],
                    enabled: true,
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(mockResponse)
        })

        it('should handle enabled parameter correctly when it is false', async () => {
            const mockResponse: any[] = []

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/stores\/.*\/.*\/configurations/)
                .reply(function (config) {
                    expect(config.params.enabled).toBe('false')
                    return [200, mockResponse]
                })

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetStoreWorkflowsConfigurations({
                    storeName: 'test-store',
                    storeType: 'shopify',
                    triggers: ['llm-prompt'],
                    enabled: false,
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(mockResponse)
        })

        it('should not include enabled parameter when it is undefined', async () => {
            const mockResponse: any[] = []

            mockedServer
                .onPost(/auth/)
                .reply(200, {})
                .onGet(/\/stores\/.*\/.*\/configurations/)
                .reply(function (config) {
                    expect(config.params.enabled).toBeUndefined()
                    return [200, mockResponse]
                })

            const { result } = renderHookWithQueryClientProvider(() =>
                useGetStoreWorkflowsConfigurations({
                    storeName: 'test-store',
                    storeType: 'shopify',
                    triggers: ['llm-prompt'],
                    enabled: undefined,
                }),
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(mockResponse)
        })
    })
})
