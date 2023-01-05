import React from 'react'
import {screen, waitFor} from '@testing-library/react'

import LD from 'launchdarkly-react-client-sdk'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {AxiosRequestConfig} from 'axios'
import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {user} from 'fixtures/users'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'
import {CustomField} from 'models/customField/types'
import {customField} from 'fixtures/customField'
import TicketFields, {TicketFieldsTab} from '../TicketFields'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({
    entities: {},
    currentUser: fromJS(user),
} as RootState)

jest.mock('../components/List', () => () => {
    return <div data-testid="ticket-fields-list"></div>
})

const mockedServer = new MockAdapter(client)

describe('<TicketFields/>', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {container} = renderWithRouter(
            <Provider store={store}>
                <TicketFields />
            </Provider>,
            {
                path: '/ticket-fields/:activeTab',
                route: `/ticket-fields/${TicketFieldsTab.Active}`,
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
                <Provider store={store}>
                    <TicketFields />
                </Provider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/${TicketFieldsTab.Active}`,
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
                <Provider store={store}>
                    <TicketFields />
                </Provider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/${TicketFieldsTab.Active}`,
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
                <Provider store={store}>
                    <TicketFields />
                </Provider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/${TicketFieldsTab.Active}`,
                }
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-fields-list')).toBeDefined()
            })

            expect(container.firstChild).toMatchSnapshot()
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
                <Provider store={store}>
                    <TicketFields />
                </Provider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/${TicketFieldsTab.Archived}`,
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
                <Provider store={store}>
                    <TicketFields />
                </Provider>,
                {
                    path: '/ticket-fields/:activeTab',
                    route: `/ticket-fields/${TicketFieldsTab.Archived}`,
                }
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-fields-list')).toBeDefined()
            })

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
