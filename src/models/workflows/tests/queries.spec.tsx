import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {renderHookWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {Paths} from 'rest_api/workflows_api/client.generated'

import {useListActionsApps} from '../queries'

const mockedServer = new MockAdapter(axios)

describe('queries', () => {
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
})
