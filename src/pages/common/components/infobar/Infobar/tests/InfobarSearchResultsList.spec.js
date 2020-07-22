// @flow
import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import InfobarSearchResultsList from '../InfobarSearchResultsList'
import type {Props} from '../InfobarSearchResultsList'

const commonProps: Props = {
    errorMessage: '',
    searchResults: [],
    defaultCustomerId: 1,
    onCustomerClick: jest.fn(),
}

describe('<InfobarSearchResultsList />', () => {
    it('Should render with initial props', () => {
        const component = shallow(<InfobarSearchResultsList {...commonProps} />)
        expect(component).toMatchSnapshot()
    })

    it('Should match snapshot if error', () => {
        const component = shallow(
            <InfobarSearchResultsList
                {...commonProps}
                errorMessage="This is an error"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('Should match snapshot when results are available', () => {
        const searchResultsMock = fromJS([
            fromJS({
                id: 1,
                name: 'test',
                email: 'testemail',
            }),
            fromJS({
                id: 2,
                name: 'test2',
                email: 'testemail2',
            }),
        ])
        const component = shallow(
            <InfobarSearchResultsList
                {...commonProps}
                searchResults={searchResultsMock}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
