import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {Infobar} from '../Infobar'
import { FETCH_PREVIEW_CUSTOMER_ERROR, FETCH_PREVIEW_CUSTOMER_SUCCESS } from '../../../../../../state/infobar/constants'


const commonProps = {
    actions: {
        widgets: {
            startEditionMode: jest.fn(() => Promise.resolve()),
            stopEditionMode: jest.fn(() => Promise.resolve()),
            submitWidgets: jest.fn(() => Promise.resolve()),
        },
        infobar: {
            fetchPreviewCustomer: jest.fn(() => Promise.resolve({resp: {}}))
        }
    },
    context: 'ticket',
    identifier: '1',
    infobar: {},
    isRouteEditingWidgets: false,
    sources: fromJS({
        ticket: {
            customer: {
                id: 2
            }
        },
        customer: {
            id: 2
        }
    }),
    customer: fromJS({
        id: 2
    }),
    widgets: fromJS({
        _internal: {
            isEditing: false
        }
    }),
    fetchCustomerHistory: jest.fn(() => Promise.resolve()),
    search: jest.fn(() => Promise.resolve({resp: {data: []}})),
    searchSimilarCustomer: jest.fn(() => Promise.resolve({customer: {id: 4}})),
    setCustomer: jest.fn(() => Promise.resolve()),
    location: {
        search: 'searchQuery'
    }
}

describe('<Infobar/>', () => {
    it('should render ticket context', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render customer context', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
                context="customer"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({isSearching: true})

        expect(component).toMatchSnapshot()
    })

    it('should render loading state because the customer is being fetched', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({isFetchingCustomer: true})

        expect(component).toMatchSnapshot()
    })

    it('should render selected customer', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            displaySelectedCustomer: true,
            selectedCustomer: fromJS({id: 7})
        })

        expect(component).toMatchSnapshot()
    })

    it('should render search results', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            displaySearchResults: true,
            searchResults: fromJS([{id: 8}, {id: 9}])
        })

        expect(component).toMatchSnapshot()
    })

    it('should render current customer with suggested customer', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
            />
        ).setState({
            suggestedCustomer: fromJS({id: 10})
        })

        expect(component).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const component = shallow(
            <Infobar
                {...commonProps}
                widgets={fromJS({
                    _internal: {
                        isEditing: true
                    }
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
                        infobar: {
                            ...commonProps.infobar,
                            fetchPreviewCustomer: jest.fn(() => Promise.resolve({
                                type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                                resp: {
                                    id: customerId
                                }
                            }))
                        }
                    }}
                />
            )

            await component.instance()._onSearchResultClick(customer)

            expect(component.state().isFetchingCustomer).toEqual(false)
            expect(component.state().selectedCustomer.get('id')).toEqual(customerId)
        })

        it('should reset spinner and keep customer empty on fetch customer failure', async () => {
            const component = shallow(
                <Infobar
                    {...commonProps}
                    actions={{
                        ...commonProps.actions,
                        infobar: {
                            ...commonProps.infobar,
                            fetchPreviewCustomer: jest.fn(() => Promise.resolve({
                                type: FETCH_PREVIEW_CUSTOMER_ERROR,
                            }))
                        }
                    }}
                />
            )

            await component.instance()._onSearchResultClick(customer)

            expect(component.state().isFetchingCustomer).toEqual(false)
            expect(component.state().selectedCustomer.get('id')).toBeUndefined()
        })
    })
})
