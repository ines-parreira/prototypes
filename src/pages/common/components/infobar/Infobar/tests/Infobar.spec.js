//@flow
import React, {type ElementProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {Infobar} from '../Infobar'
import {
    FETCH_PREVIEW_CUSTOMER_ERROR,
    FETCH_PREVIEW_CUSTOMER_SUCCESS,
} from '../../../../../../state/infobar/constants'
import {
    startEditionMode,
    stopEditionMode,
    submitWidgets,
} from '../../../../../../state/widgets/actions.ts'
import Search from '../../../Search'

jest.mock(
    '../../../Search',
    () => ({onChange, ...other}: ElementProps<typeof Search>) => (
        <input {...other} onChange={onChange} />
    )
)

const commonProps = {
    actions: {
        widgets: {
            startEditionMode: jest.fn(startEditionMode),
            stopEditionMode: jest.fn(stopEditionMode),
            submitWidgets: jest.fn(submitWidgets),
        },
        fetchPreviewCustomer: jest.fn(() => Promise.resolve({resp: {}})),
    },
    context: 'ticket',
    identifier: '1',
    infobar: {},
    isRouteEditingWidgets: false,
    sources: fromJS({
        ticket: {
            customer: {
                id: 2,
            },
        },
        customer: {
            id: 2,
        },
    }),
    customer: fromJS({
        id: 2,
    }),
    widgets: fromJS({
        _internal: {
            isEditing: false,
        },
    }),
    fetchCustomerHistory: jest.fn(() => () => Promise.resolve()),
    searchCancellable: jest.fn(() => Promise.resolve({resp: {data: []}})),
    searchSimilarCustomer: jest.fn(() => Promise.resolve({customer: {id: 4}})),
    setCustomer: jest.fn(() => Promise.resolve()),
    location: {
        search: 'searchQuery',
        pathname: 'foo',
        query: {},
    },
}

describe('<Infobar/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render ticket context', () => {
        const component = shallow(<Infobar {...commonProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render customer context', () => {
        const component = shallow(
            <Infobar {...commonProps} context="customer" />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const component = shallow(<Infobar {...commonProps} />).setState({
            isSearching: true,
        })

        expect(component).toMatchSnapshot()
    })

    it('should render the error when loading error', (done) => {
        const mockedErrorSearch = jest
            .fn()
            .mockResolvedValue({error: 'generic_error'})

        const component = shallow(
            <Infobar {...commonProps} searchCancellable={mockedErrorSearch} />
        )

        component.find(Search).simulate('change', 'query')
        setImmediate(() => {
            expect(component).toMatchSnapshot()
            done()
        })
    })

    it('should render loading state because the customer is being fetched', () => {
        const component = shallow(<Infobar {...commonProps} />).setState({
            isFetchingCustomer: true,
        })

        expect(component).toMatchSnapshot()
    })

    it('should render selected customer', () => {
        const component = shallow(<Infobar {...commonProps} />).setState({
            displaySelectedCustomer: true,
            selectedCustomer: fromJS({id: 7}),
        })

        expect(component).toMatchSnapshot()
    })

    it('should render search results', () => {
        const component = shallow(<Infobar {...commonProps} />).setState({
            displaySearchResults: true,
            searchResults: fromJS([{id: 8}, {id: 9}]),
        })

        expect(component).toMatchSnapshot()
    })

    it('should render current customer with suggested customer', () => {
        const component = shallow(<Infobar {...commonProps} />).setState({
            suggestedCustomer: fromJS({id: 10}),
        })

        expect(component).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const component = shallow(
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

        expect(component).toMatchSnapshot()
    })

    describe('_onSearchResultClick()', () => {
        let customer: Map
        let customerId = 5

        beforeEach(() => {
            customerId = 5
            customer = new Map()
            customer.set('id', customerId)
        })

        it('should reset spinner and select customer on fetch customer success', async () => {
            const component = shallow(
                <Infobar
                    {...commonProps}
                    actions={{
                        ...commonProps.actions,
                        fetchPreviewCustomer: jest.fn(() =>
                            Promise.resolve({
                                type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                                resp: {
                                    id: customerId,
                                },
                            })
                        ),
                    }}
                />
            )

            await component.instance()._onSearchResultClick(customer)

            expect(component.state().isFetchingCustomer).toEqual(false)
            expect(component.state().selectedCustomer.get('id')).toEqual(
                customerId
            )
        })

        it('should reset spinner and keep customer empty on fetch customer failure', async () => {
            const component = shallow(
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

            await component.instance()._onSearchResultClick(customer)

            expect(component.state().isFetchingCustomer).toEqual(false)
            expect(component.state().selectedCustomer.get('id')).toBeUndefined()
        })

        it('should start edition mode, because it is mounting in edition mode and the widgets state is not in edit mode', () => {
            shallow(<Infobar {...commonProps} isRouteEditingWidgets={true} />)

            expect(
                commonProps.actions.widgets.startEditionMode
            ).toHaveBeenNthCalledWith(1, commonProps.context)
        })

        it('should stop edition mode, because it is mounting in read mode and the widgets state is in edit mode', () => {
            shallow(
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
})
