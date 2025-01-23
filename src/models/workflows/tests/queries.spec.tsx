import {act} from '@testing-library/react-hooks'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {getGorgiasWfApiClient} from 'rest_api/workflows_api/client'
import {Paths} from 'rest_api/workflows_api/client.generated'
import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {
    useGetActionsApp,
    useListActionsApps,
    useUpsertActionsApp,
    useGetConfigurationExecutions,
    useGetConfigurationExecution,
    useGetConfigurationExecutionLogs,
    useDeleteWorkflowConfigurationTemplate,
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useListActionsApps()
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useGetActionsApp(actionsApp.id)
            )

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
            expect(result.current.data).toEqual(actionsApp)
        })

        it('should not call API if id is missing', () => {
            const {result} = renderHookWithQueryClientProvider(() =>
                useGetActionsApp()
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useUpsertActionsApp()
            )

            act(() => {
                result.current.mutate([{id: actionsApp.id}, actionsApp])
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutions({
                    configurationInternalId: 'someid',
                    from: new Date(),
                    orderBy: 'ASC',
                    page: 1,
                    to: new Date(),
                    success: true,
                })
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecution('configurationId', 'executionId')
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutionLogs(
                    'configurationId',
                    'executionId'
                )
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useGetConfigurationExecutionLogs(
                    'configurationId',
                    'executionId'
                )
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

            const {result, waitFor} = renderHookWithQueryClientProvider(() =>
                useDeleteWorkflowConfigurationTemplate()
            )

            act(() => {
                result.current.mutate([{internal_id: 'someid'}])
            })

            await waitFor(() => expect(result.current.isSuccess).toEqual(true))
        })
    })
})
