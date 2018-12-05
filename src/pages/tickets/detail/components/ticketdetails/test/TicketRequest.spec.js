import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TicketRequest} from '../TicketRequest'

describe('TicketRequest component', () => {
    it('should display requests', () => {
        window.DEVELOPMENT = true
        const requests = fromJS([
            {id: 123, name: 'some name'},
            {id: 234, name: 'other name'},
        ])
        expect(shallow(
            <TicketRequest
                request={requests.first()}
                requests={requests}
            />
        )).toMatchSnapshot()
        window.DEVELOPMENT = false
    })
    it('should display empty dropdown', () => {
        window.DEVELOPMENT = true
        expect(shallow(<TicketRequest/>)).toMatchSnapshot()
        window.DEVELOPMENT = false
    })

    it('should be null if not development', () => {
        expect(shallow(<TicketRequest/>)).toMatchSnapshot()
    })
})
