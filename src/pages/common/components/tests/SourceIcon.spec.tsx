import React from 'react'
import {shallow} from 'enzyme'

import SourceIcon from '../SourceIcon'
import * as ticketConfig from '../../../../config/ticket'
import {TicketMessageSourceType} from '../../../../business/types/ticket'

describe('SourceIcon component', () => {
    it('should show default icon', () => {
        const component = shallow(<SourceIcon />)
        expect(component).toMatchSnapshot()
    })

    it('should show USABLE_SOURCE_TYPES icons', () => {
        ticketConfig.USABLE_SOURCE_TYPES.forEach((type) => {
            const component = shallow(<SourceIcon type={type} />)
            expect(component).toMatchSnapshot()
        })
    })

    it('should show SYSTEM_SOURCE_TYPES icons', () => {
        ticketConfig.SYSTEM_SOURCE_TYPES.forEach((type) => {
            const component = shallow(<SourceIcon type={type} />)
            expect(component).toMatchSnapshot()
        })
    })

    it('should show HELP_CENTER_CONTACT_FORM icons', () => {
        const component = shallow(
            <SourceIcon type={TicketMessageSourceType.HelpCenterContactForm} />
        )
        expect(component).toMatchSnapshot()
    })
})
