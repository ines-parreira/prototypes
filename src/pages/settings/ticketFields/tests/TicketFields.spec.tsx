import React from 'react'
import {act, screen, waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {AxiosRequestConfig} from 'axios'
import {QueryClientProvider} from '@tanstack/react-query'

import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {user} from 'fixtures/users'
import client from 'models/api/resources'
import {flushPromises, renderWithRouter} from 'utils/testing'
import {CustomField} from 'models/customField/types'
import {customField} from 'fixtures/customField'
import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import TicketFields from '../TicketFields'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({
    entities: {},
    currentUser: fromJS(user),
} as RootState)

jest.mock('../components/List', () => () => {
    return <div data-testid="ticket-fields-list"></div>
})

const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

describe('<TicketFields/>', () => {
    beforeEach(async () => {
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        mockedServer.onGet('/api/custom-fields/').reply(200, {
            data: [],
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        })

        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TicketFields />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/ticket-fields/:activeTab',
                route: `/ticket-fields/active`,
            }
        )

        expect(container.firstChild).toBeNull()
    })

    describe('account has the feature flag', () => {
        it('should render get started', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))

            mockedServer.onGet('/api/custom-fields/').reply(200, {
                data: [],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/active`,
                }
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/Get started with Ticket Fields/)
                ).toBeDefined()
                expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render no active ticket fields', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))

            mockedServer
                .onGet('/api/custom-fields/')
                .reply((config: AxiosRequestConfig) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const data: CustomField[] = !config.params.archived
                        ? []
                        : [customField]

                    return [
                        200,
                        {
                            data: data,
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        },
                    ]
                })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/active`,
                }
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /You don't have any active ticket fields at the moment/
                    )
                ).toBeDefined()
                expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render active ticket fields', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))

            mockedServer
                .onGet('/api/custom-fields/')
                .reply((config: AxiosRequestConfig) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const data: CustomField[] = !config.params.archived
                        ? [customField]
                        : []
                    return [
                        200,
                        {
                            data: data,
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        },
                    ]
                })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/active`,
                }
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-fields-list')).toBeDefined()
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        // TODO: fix this test when this was addressed: https://github.com/TanStack/query/issues/4655#issuecomment-1438957991
        // using `jest.useFakeTimers()` breaks react-query unless you are not mocking setTimeout
        // but we need to mock the setTimeout because it is being used by useDebounce
        // and we need to advance it for testing te debounced input
        it.skip('should render no results found', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))
            jest.useFakeTimers()

            mockedServer
                .onGet('/api/custom-fields/')
                .reply((config: AxiosRequestConfig) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    let data: CustomField[] = [customField]

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (config.params.search) {
                        data = []
                    }
                    return [
                        200,
                        {
                            data: data,
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        },
                    ]
                })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/active`,
                }
            )

            jest.runAllTimers()
            await act(flushPromises)

            await waitFor(() => {
                expect(screen.getByTestId('ticket-fields-list')).toBeDefined()
            })

            const searchInput = screen.getByPlaceholderText(
                'Search ticket fields...'
            )

            await userEvent.type(searchInput, 'foo')

            jest.runAllTimers()
            await act(flushPromises)

            await waitFor(() => {
                expect(screen.getByText(/No results found./)).toBeDefined()
                expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
            })

            expect(container.firstChild).toMatchSnapshot()
            jest.useRealTimers()
        })

        it('should render no archived ticket fields', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))

            mockedServer
                .onGet('/api/custom-fields/')
                .reply((config: AxiosRequestConfig) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const data: CustomField[] = !config.params.archived
                        ? [customField]
                        : []
                    return [
                        200,
                        {
                            data: data,
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        },
                    ]
                })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/archived`,
                }
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /You don't have any archived ticket fields at the moment/
                    )
                ).toBeDefined()
                expect(screen.queryByTestId('ticket-fields-list')).toBeNull()
            })

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render archived ticket fields', async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.TicketFields]: true,
            }))

            mockedServer
                .onGet('/api/custom-fields/')
                .reply((config: AxiosRequestConfig) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const data: CustomField[] = !config.params.archived
                        ? []
                        : [customField]
                    return [
                        200,
                        {
                            data: data,
                            meta: {
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        },
                    ]
                })

            const {container} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <TicketFields />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/archived`,
                }
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-fields-list')).toBeDefined()
            })

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
