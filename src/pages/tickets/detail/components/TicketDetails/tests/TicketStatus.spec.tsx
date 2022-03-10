import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import TicketStatus from '../TicketStatus'

describe('TicketStatus component', () => {
    const minProps: ComponentProps<typeof TicketStatus> = {
        setQuickStatus: jest.fn(),
        currentStatus: 'closed',
    }
    it('closed ticket', () => {
        const component = shallow(<TicketStatus {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('open ticket', () => {
        const component = shallow(
            <TicketStatus {...minProps} currentStatus="open" />
        )
        expect(component).toMatchSnapshot()
    })
})
