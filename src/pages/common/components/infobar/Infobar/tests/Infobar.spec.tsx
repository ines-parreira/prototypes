import React, {ComponentProps, useState as mockUseState} from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {renderWithRouter} from 'utils/testing'
import {
    FETCH_PREVIEW_CUSTOMER_ERROR,
    FETCH_PREVIEW_CUSTOMER_SUCCESS,
} from 'state/infobar/constants'
import {WidgetContextType} from 'state/widgets/types'
import {account} from 'fixtures/account'
import {SearchEngine} from 'models/search/types'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import {mockSearchRank} from 'fixtures/searchRank'

import Search from '../../../Search'
import InfobarLayout from '../../InfobarLayout'
import InfobarCustomerInfo from '../InfobarCustomerInfo/InfobarCustomerInfo'
import InfobarSearchResultsList from '../InfobarSearchResultsList'
import {Infobar} from '../Infobar'

jest.mock(
    '../../../Search.tsx',
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
    '../InfobarCustomerInfo/InfobarCustomerInfo.tsx',
    () =>
        ({customer}: ComponentProps<typeof InfobarCustomerInfo>) =>
            (
                <div data-testid="InfobarCustomerInfo">
                    InfobarCustomerInfo
                    <div>customer: {JSON.stringify(customer)}</div>
                </div>
            )
)

jest.mock(
    '../../InfobarLayout',
    () =>
        ({children}: ComponentProps<typeof InfobarLayout>) =>
            <div data-testid="InfobarLayout">{children}</div>
)

jest.mock('../../../MergeCustomers/MergeCustomersContainer', () => () => (
    <div>MergeCustomersContainer</div>
))

const mockCustomer = fromJS({id: 7})

jest.mock(
    '../InfobarSearchResultsList',
    () =>
        ({
            errorMessage,
            defaultCustomerId,
            onCustomerClick,
            searchResults,
        }: ComponentProps<typeof InfobarSearchResultsList>) =>
            (
                <div
                    data-testid="InfobarSearchResultsList"
                    onClick={() => {
                        void onCustomerClick(mockCustomer, 0)
                    }}
                >
                    <div>errorMessage: {errorMessage}</div>
                    <div>defaultCustomerId: {defaultCustomerId}</div>
                    <div>searchResults: {JSON.stringify(searchResults)}</div>
                </div>
            )
)

jest.mock('hooks/useSearchRankScenario')
;(
    useSearchRankScenario as jest.MockedFunction<typeof useSearchRankScenario>
).mockImplementation(() => mockSearchRank)

const commonProps = {
    actions: {
        fetchPreviewCustomer: jest.fn(() => Promise.resolve({resp: {}})),
        widgets: {
            cancelDrag: jest.fn(),
            drag: jest.fn(),
            drop: jest.fn(),
            generateAndSetWidgets: jest.fn(),
            removeEditedWidget: jest.fn(),
            resetWidgets: jest.fn(),
            setEditedWidgets: jest.fn(),
            setEditionAsDirty: jest.fn(),
            startEditionMode: jest.fn(),
            startWidgetEdition: jest.fn(),
            stopEditionMode: jest.fn(),
            stopWidgetEdition: jest.fn(),
            submitWidgets: jest.fn(),
            updateEditedWidget: jest.fn(),
        },
    },
    context: 'ticket',
    customer: fromJS({
        id: 2,
    }),
    fetchCustomerHistory: jest.fn(() => () => Promise.resolve()),
    identifier: '1',
    isRouteEditingWidgets: false,
    location: {
        search: 'searchQuery',
        pathname: 'foo',
        query: {},
    },
    searchCustomers: jest.fn(() => Promise.resolve({resp: {data: []}})),
    searchSimilarCustomer: jest.fn(() => Promise.resolve({customer: {id: 4}})),
    setCustomer: jest.fn(() => Promise.resolve()),
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
    currentAccount: fromJS(account),
} as unknown as ComponentProps<typeof Infobar>

let dateNowSpy: jest.SpiedFunction<typeof Date.now>
const defaultDateNowValue = 1487076708000

describe('<Infobar/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => defaultDateNowValue)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render ticket context', () => {
        const {container} = renderWithRouter(<Infobar {...commonProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render customer context', () => {
        const {container} = renderWithRouter(
            <Infobar {...commonProps} context={WidgetContextType.Customer} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const {container, getByTestId} = renderWithRouter(
            <Infobar {...commonProps} />
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the error when loading error', async () => {
        const mockedErrorSearch = jest
            .fn()
            .mockResolvedValue({error: 'generic_error'})

        const {container, getByTestId, getByText} = renderWithRouter(
            <Infobar {...commonProps} searchCustomers={mockedErrorSearch} />
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => getByText(/Failed to do the search/i))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the customer is being fetched', async () => {
        const {container, getByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchCustomers={() =>
                    Promise.resolve({
                        resp: {data: [{id: 7}, {id: 8}, {id: 9}]},
                    })
                }
            />
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
        const {container, getByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                actions={{
                    ...commonProps.actions,
                    fetchPreviewCustomer: (id) =>
                        Promise.resolve({
                            type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                            resp: {
                                id,
                            },
                        }),
                }}
            />
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
        const {container, getByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchCustomers={() =>
                    Promise.resolve({
                        resp: {data: [{id: 8}, {id: 9}]},
                    })
                }
            />
        )
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => getByTestId('InfobarSearchResultsList'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current customer with suggested customer', async () => {
        const {container, getByText} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchSimilarCustomer={() =>
                    Promise.resolve({
                        customer: fromJS({id: 10}),
                    })
                }
            />
        )

        await waitFor(() =>
            getByText(/We have found someone similar to the customer/)
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const {container} = renderWithRouter(
            <Infobar
                {...commonProps}
                widgets={fromJS({
                    _internal: {
                        isEditing: true,
                    },
                })}
                isRouteEditingWidgets={true}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    describe('onSearchResultClick()', () => {
        let customer: Map<any, any>
        let customerId = 5

        beforeEach(() => {
            customerId = 5
            customer = fromJS({})
            customer.set('id', customerId)
        })

        it('should reset spinner and keep customer empty on fetch customer failure', async () => {
            const {container, getByTestId} = renderWithRouter(
                <Infobar
                    {...commonProps}
                    actions={{
                        ...commonProps.actions,
                        fetchPreviewCustomer: jest.fn(() =>
                            Promise.resolve({
                                type: FETCH_PREVIEW_CUSTOMER_ERROR,
                            })
                        ),
                    }}
                />
            )
            fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
            fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

            await waitFor(() =>
                fireEvent.click(getByTestId('InfobarSearchResultsList'))
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should start edition mode, because it is mounting in edition mode and the widgets state is not in edit mode', () => {
            renderWithRouter(
                <Infobar {...commonProps} isRouteEditingWidgets={true} />
            )

            expect(
                commonProps.actions.widgets.startEditionMode
            ).toHaveBeenNthCalledWith(1, commonProps.context)
        })

        it('should stop edition mode, because it is mounting in read mode and the widgets state is in edit mode', () => {
            renderWithRouter(
                <Infobar
                    {...commonProps}
                    widgets={fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    })}
                />
            )

            expect(
                commonProps.actions.widgets.stopEditionMode
            ).toHaveBeenNthCalledWith(1)
        })
    })

    it('should register search rank scenario event when user clicks the result', async () => {
        const results: {id: number}[] = []
        for (let i = 0; i < 20; i++) {
            results.push({id: i})
        }
        const {getByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchCustomers={() => {
                    dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
                    return Promise.resolve({
                        resp: {data: results, searchEngine: SearchEngine.ES},
                    })
                }}
            />
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

    it('should end the search rank scenario when user click Back button', async () => {
        const {getByText, getByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchCustomers={() => {
                    dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
                    return Promise.resolve({resp: {data: [{id: 1}]}})
                }}
            />
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => fireEvent.click(getByText('Back')))

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
    })

    it('should end the search rank scenario when user performs the second search', async () => {
        const {getByTestId, findByTestId} = renderWithRouter(
            <Infobar
                {...commonProps}
                searchCustomers={() => {
                    dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
                    return Promise.resolve({resp: {data: [{id: 1}]}})
                }}
            />
        )

        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        await waitFor(() => findByTestId('InfobarSearchResultsList'))
        fireEvent.change(getByTestId('Search'), {target: {value: 'query'}})
        fireEvent.keyDown(getByTestId('Search'), {key: 'Enter'})

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
    })
})
