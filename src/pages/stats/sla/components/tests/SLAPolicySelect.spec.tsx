import {SLAPolicy, useListSlaPolicies} from '@gorgias/api-queries'
import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'

import {
    DESELECT_ALL_LABEL,
    SELECT_ALL_LABEL,
} from 'pages/common/components/dropdown/DropdownQuickSelect'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'
import {mergeStatsFilters} from 'state/stats/actions'
import {RootState, StoreDispatch} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@gorgias/api-queries')
const useListSlaPoliciesMock = assumeMock(useListSlaPolicies)

describe('<SLAPolicySelect />', () => {
    const policy = {
        name: 'someName',
        uuid: 'some-id',
        archived_datetime: 'asd',
        created_datetime: 'xyz',
        deactivated_datetime: 'qwe',
        metrics: [],
        target_channels: [],
        updated_datetime: 'asd',
        version: 1,
    }
    const aPolicy = {
        ...policy,
        name: 'ABC',
        uuid: '123',
    }
    const anotherPolicy = {
        ...policy,
        name: 'XYZ',
        uuid: '456',
    }
    const policies: SLAPolicy[] = [
        aPolicy,
        anotherPolicy,
        {
            ...policy,
            uuid: '789',
            name: 'QWE',
        },
    ]
    const defaultState = {
        stats: fromJS({
            filters: {
                integrations: [integrationsState.integrations[1].id],
                channels: [TicketChannel.Chat],
                agents: [agents[0].id],
                tags: [1],
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
        useListSlaPoliciesMock.mockReturnValue({
            data: {data: {data: policies}},
            isError: false,
            isLoading: false,
        } as any)
    })

    it('should render loading skeleton when loading polices', async () => {
        useListSlaPoliciesMock.mockReturnValue({
            data: undefined,
            isError: false,
            isLoading: true,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <SLAPolicySelect />
            </Provider>
        )

        await waitFor(() => {
            expect(document.querySelector('.skeleton')).toBeInTheDocument()
        })
    })

    it('should render the list of available policies', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SLAPolicySelect />
            </Provider>
        )
        userEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            policies.forEach((policy) => {
                expect(screen.getByText(policy.name)).toBeInTheDocument()
            })
        })
    })

    it('should allow selection of a policy', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )

        userEvent.click(screen.getByRole('button'))
        expect(
            within(screen.getByRole('option', {name: aPolicy.name})).getByRole(
                'checkbox'
            )
        ).not.toBeChecked()
        userEvent.click(screen.getByRole('option', {name: aPolicy.name}))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                slaPolicies: [aPolicy.uuid],
            })
        )
    })

    it('should allow deselection of a policy', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    slaPolicies: [aPolicy.uuid],
                },
            }),
        })

        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )
        userEvent.click(screen.getByRole('button'))
        userEvent.click(screen.getByRole('option', {name: aPolicy.name}))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                slaPolicies: [],
            })
        )
    })

    it('should allow selection of multiple policies', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    slaPolicies: [aPolicy.uuid],
                },
            }),
        })

        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )

        userEvent.click(screen.getByRole('button'))
        expect(
            within(
                screen.getByRole('option', {name: anotherPolicy.name})
            ).getByRole('checkbox')
        ).not.toBeChecked()
        userEvent.click(screen.getByRole('option', {name: anotherPolicy.name}))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                slaPolicies: [aPolicy.uuid, anotherPolicy.uuid],
            })
        )
    })

    it('should allow selection of All policies', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    slaPolicies: [],
                },
            }),
        })

        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )

        userEvent.click(screen.getByRole('button'))
        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(SELECT_ALL_LABEL),
            })
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                slaPolicies: policies.map((policy) => policy.uuid),
            })
        )
    })

    it('should allow de selection of All policies', async () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    slaPolicies: policies.map((policy) => policy.uuid),
                },
            }),
        })

        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )

        userEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            policies.forEach((policy) => {
                expect(
                    within(
                        screen.getByRole('option', {name: policy.name})
                    ).getByRole('checkbox')
                ).toBeChecked()
            })
        })

        userEvent.click(
            screen.getByRole('option', {
                name: new RegExp(DESELECT_ALL_LABEL),
            })
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                slaPolicies: [],
            })
        )
    })

    it('should submit filters dirty/clean state', async () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                    slaPolicies: policies.map((policy) => policy.uuid),
                },
            }),
        })

        render(
            <Provider store={store}>
                <SLAPolicySelect />
            </Provider>
        )

        userEvent.click(screen.getByRole('button'))
        userEvent.click(screen.getByText(aPolicy.name))
        userEvent.click(screen.getByTestId('floating-overlay'))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(statFiltersDirty())
            expect(store.getActions()).toContainEqual(statFiltersClean())
        })
    })
})
