import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {TicketTags} from '../TicketTags'

describe('TicketTags component', () => {
    const minProps = {
        addTags: jest.fn(),
        cancelFieldEnumSearchCancellable: jest.fn(),
        fieldEnumSearchCancellable: jest.fn(),
        removeTag: jest.fn(),
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
        ]),
    }

    it('should display current tags', () => {
        const {container} = render(<TicketTags {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
