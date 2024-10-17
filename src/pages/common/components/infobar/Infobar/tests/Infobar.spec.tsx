import React, {ComponentProps, useState as mockUseState} from 'react'
import {fireEvent, waitFor, screen, act} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {agents} from 'fixtures/agents'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {FETCH_PREVIEW_CUSTOMER_SUCCESS} from 'state/infobar/constants'
import {WidgetEnvironment} from 'state/widgets/types'
import {startEditionMode, stopEditionMode} from 'state/widgets/actions'
import {
    similarCustomer,
    fetchPreviewCustomer,
    searchWithHighlights,
} from 'state/infobar/actions'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import {mockSearchRank} from 'fixtures/searchRank'

import Search from 'pages/common/components/Search'
import InfobarLayout from 'pages/common/components/infobar/InfobarLayout'
import InfobarCustomerInfo from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import {InfobarSearchResultsList} from 'pages/common/components/infobar/Infobar/InfobarSearchResultsList'
import {Infobar} from 'pages/common/components/infobar/Infobar/Infobar'

const mockStore = configureMockStore()

jest.mock('state/infobar/actions')
jest.mock('state/widgets/actions')
const mockedSearch = assumeMock(searchWithHighlights)
const mockedSimilarCustomer = assumeMock(similarCustomer)
const mockedFetchPreviewCustomer = assumeMock(fetchPreviewCustomer)
const mockedStartEditionMode = assumeMock(startEditionMode)
const mockedStopEditionMode = assumeMock(stopEditionMode)

const store = mockStore({
    currentUser: fromJS(agents[1]),
})
// @ts-ignore
store.dispatch = jest.fn((param: () => unknown) =>
    typeof param === 'function' ? param() : param
)

jest.mock(
    'pages/common/components/Search.tsx',
    () =>
        ({onChange, onKeyDown, ...other}: ComponentProps<typeof Search>) => {
            const [value, setValue] = mockUseState('')

            return (
                <input
                    data-testid="Search"
                    {...other}
                    onChange={(e) => {
                        setValue(e.target.value)
                        onChange && onChange(e.target.value)
                    }}
                    onKeyDown={(e) => onKeyDown && onKeyDown(e, value)}
                />
            )
        }
)

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo.tsx',
    () =>
        ({customer}: ComponentProps<typeof InfobarCustomerInfo>) => (
            <div data-testid="InfobarCustomerInfo">
                InfobarCustomerInfo
                <div>customer: {JSON.stringify(customer)}</div>
            </div>
        )
)

jest.mock(
    'pages/common/components/infobar/InfobarLayout',
    () =>
        ({children}: ComponentProps<typeof InfobarLayout>) => (
            <div data-testid="InfobarLayout">{children}</div>
        )
)

jest.mock(
    'pages/common/components/MergeCustomers/MergeCustomersContainer',
    () => () => <div>MergeCustomersContainer</div>
)

jest.mock('pages/common/components/infobar/Infobar/InfobarSearchResultsList')
const InfobarSearchResultsListMock = assumeMock(InfobarSearchResultsList)

jest.mock('hooks/useSearchRankScenario')
const useSearchRankScenarioMock = assumeMock(useSearchRankScenario)

const commonProps: ComponentProps<typeof Infobar> = {
    context: WidgetEnvironment.Ticket,
    customer: fromJS({
        id: 2,
    }),
    identifier: '1',
    isRouteEditingWidgets: false,
    sources: fromJS({
        ticket: {
            customer: {
                id: 2,
            },
        },
        customer: {
            id: 2,
            data: {name: 'Marie Curie'},
        },
    }),
    widgets: fromJS({
        currentContext: 'customer',
        _internal: {
            isEditing: false,
            hasFetchedWidgets: true,
        },
    }),
}

let dateNowSpy: jest.SpiedFunction<typeof Date.now>
const defaultDateNowValue = 1487076708000
const customerId = 7

describe('<Infobar/>', () => {
    beforeEach(() => {
        useSearchRankScenarioMock.mockImplementation(() => mockSearchRank)
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => defaultDateNowValue)
        mockedSimilarCustomer.mockReset()
        mockedFetchPreviewCustomer.mockReset()
        InfobarSearchResultsListMock.mockImplementation(
            ({
                errorMessage,
                defaultCustomerId,
                onCustomerClick,
                searchResults,
            }: ComponentProps<typeof InfobarSearchResultsList>) => (
                <div
                    data-testid="InfobarSearchResultsList"
                    onClick={() => {
                        void onCustomerClick(customerId, 0)
                    }}
                >
                    <div>errorMessage: {errorMessage}</div>
                    <div>defaultCustomerId: {defaultCustomerId}</div>
                    <div>searchResults: {JSON.stringify(searchResults)}</div>
                </div>
            )
        )
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render ticket context', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />)
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render customer context', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    context={WidgetEnvironment.Customer}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const {container, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        act(() => {
            fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
            fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ignore other keys', () => {
        const {container, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        act(() => {
            fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
            fireEvent.keyDown(getByTestId('Search'), {key: '{Backspace}'})
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the error when loading error', async () => {
        mockedSearch.mockImplementation(
            () => () => Promise.resolve({error: 'generic_error'})
        )

        const {container, getByTestId, getByText} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => getByText(/Failed to do the search/i))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the customer is being fetched', async () => {
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {data: {data: [{id: 7}, {id: 8}, {id: 9}]}},
                })
        )
        const {container, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        const InfobarSearchResultsList = await waitFor(() =>
            getByTestId('InfobarSearchResultsList')
        )
        fireEvent.click(InfobarSearchResultsList)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render selected customer', async () => {
        mockedFetchPreviewCustomer.mockImplementation(
            (id) => () =>
                Promise.resolve({
                    type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                    resp: {
                        id,
                    },
                })
        )
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {
                        data: {
                            data: [
                                {entity: {id: 7}, highlights: {}},
                                {
                                    entity: {id: 8},
                                    highlights: {},
                                },
                                {entity: {id: 9}, highlights: {}},
                            ],
                        },
                    },
                })
        )
        const {container, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        const InfobarSearchResultsList = await waitFor(() =>
            getByTestId('InfobarSearchResultsList')
        )
        fireEvent.click(InfobarSearchResultsList)
        await waitFor(() => getByTestId('InfobarCustomerInfo'))

        expect(container).toMatchSnapshot()
    })

    it('should render search results', async () => {
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {
                        data: {
                            data: [
                                {entity: {id: 8}, highlights: {}},
                                {
                                    entity: {
                                        id: 9,
                                    },
                                    highlights: {},
                                },
                            ],
                        },
                    },
                })
        )
        const {container, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => getByTestId('InfobarSearchResultsList'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current customer with suggested customer', async () => {
        mockedSimilarCustomer.mockImplementation(
            () => () =>
                Promise.resolve({
                    customer: fromJS({id: 10}),
                })
        )

        const {container, getByText} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        await waitFor(() => getByText(/Another customer profile/))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    widgets={fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    })}
                    isRouteEditingWidgets={true}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    describe('onSearchResultClick()', () => {
        it('should reset spinner and keep customer empty on fetch customer failure', async () => {
            mockedSearch.mockImplementation(
                () => () =>
                    Promise.resolve({
                        resp: {
                            data: {data: [{entity: {id: 7}, highlights: {}}]},
                        },
                    })
            )

            mockedSimilarCustomer.mockImplementation(
                () => () =>
                    Promise.resolve({
                        customer: fromJS({}),
                    })
            )

            const {container, getByTestId} = renderWithRouter(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>
            )
            fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
            fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

            await waitFor(() =>
                fireEvent.click(getByTestId('InfobarSearchResultsList'))
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should register search rank scenario event when user clicks the result', async () => {
            const results: {id: number}[] = []
            for (let i = 0; i < 20; i++) {
                results.push({id: i})
            }

            mockedSearch.mockImplementation(() => () => {
                dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
                return Promise.resolve({
                    resp: {
                        data: {data: results},
                        // searchEngine: SearchEngine.ES,
                    },
                })
            })

            const {getByTestId} = renderWithRouter(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>
            )

            fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
            fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

            await waitFor(() =>
                fireEvent.click(getByTestId('InfobarSearchResultsList'))
            )

            expect(
                (mockSearchRank.registerResultsRequest as jest.Mock).mock.calls
            ).toMatchSnapshot()
            expect(
                (mockSearchRank.registerResultsResponse as jest.Mock).mock.calls
            ).toMatchSnapshot()
            expect(
                (mockSearchRank.registerResultSelection as jest.Mock).mock.calls
            ).toMatchSnapshot()
        })
    })

    it('should not show widget edition button', () => {
        const store = configureMockStore()({
            currentUser: fromJS(agents[0]),
        })
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents,@typescript-eslint/no-redundant-type-constituents
        store.dispatch = jest.fn((param: () => unknown | unknown) =>
            typeof param === 'function' ? param() : param
        )
        renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        expect(
            screen.queryByRole('button', {
                name: /settings/,
            })
        ).toBeNull()
    })

    it('should start edition mode, because it is mounting in edition mode and the widgets state is not in edit mode', () => {
        renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} isRouteEditingWidgets={true} />
            </Provider>
        )

        expect(mockedStartEditionMode).toHaveBeenNthCalledWith(
            1,
            commonProps.context
        )
    })

    it('should stop edition mode, because it is mounting in read mode and the widgets state is in edit mode', () => {
        renderWithRouter(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    widgets={fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    })}
                />
            </Provider>
        )

        expect(mockedStopEditionMode).toHaveBeenNthCalledWith(1)
    })

    it('should end the search rank scenario when user click Back button', async () => {
        mockedSearch.mockImplementation(() => () => {
            dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
            return Promise.resolve({resp: {data: {data: [{id: 1}]}}})
        })
        const {getByPlaceholderText, getByText, getByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} customer={fromJS({})} />
            </Provider>
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => fireEvent.click(getByText('Back')))

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
        await waitFor(() =>
            expect(
                getByPlaceholderText(
                    'Search for customers by email, order number, etc.'
                )
            )
        )
    })

    it('should end the search rank scenario when user performs the second search', async () => {
        mockedSearch.mockImplementation(() => () => {
            dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
            return Promise.resolve({resp: {data: {data: [{id: 1}]}}})
        })

        const {getByTestId, findByTestId} = renderWithRouter(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => findByTestId('InfobarSearchResultsList'))
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
    })
})
