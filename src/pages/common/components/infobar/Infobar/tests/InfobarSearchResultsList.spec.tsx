import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import InfobarSearchResultsList from '../InfobarSearchResultsList'

const commonProps = {
    errorMessage: '',
    searchResults: fromJS([]),
    defaultCustomerId: 1,
    onCustomerClick: jest.fn(),
}

describe('<InfobarSearchResultsList />', () => {
    it('Should render with initial props', () => {
        const {container} = render(
            <InfobarSearchResultsList {...commonProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('Should match snapshot if error', () => {
        const {container} = render(
            <InfobarSearchResultsList
                {...commonProps}
                errorMessage="This is an error"
            />
        )
        expect(container.firstChild).toMatchSnapshot()
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
        const {container} = render(
            <InfobarSearchResultsList
                {...commonProps}
                searchResults={searchResultsMock}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
