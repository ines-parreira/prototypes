import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import {act} from '@testing-library/react-hooks'

import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {Paths} from 'rest_api/workflows_api/client.generated'
import {getGorgiasWfApiClient} from 'rest_api/workflows_api/client'

import {
    useGetActionsApp,
    useListActionsApps,
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
})
