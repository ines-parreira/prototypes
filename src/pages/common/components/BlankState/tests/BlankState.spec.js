import React from 'react'
import {shallow} from 'enzyme'

import BlankState from '../components/BlankState.tsx'

describe('BlankState component', () => {
    it('default with undefined props', () => {
        const component = shallow(<BlankState />)
        expect(component.find('.blank-state-message')).toIncludeText(
            'Enjoy your day!'
        )
    })

    it('custom message', () => {
        const component = shallow(
            <BlankState message={<div>Custom message</div>} />
        )
        expect(component).toContainReact(
            <div className="blank-state">
                <div>Custom message</div>
            </div>
        )
    })

    it('more than 10 tickets closed', () => {
        const component = shallow(<BlankState totalClosedTickets={11} />)

        expect(component.find('.blank-state-message')).toIncludeText(
            'No more tickets here!'
        )
    })

    it('more than 100 tickets closed', () => {
        const component = shallow(<BlankState totalClosedTickets={101} />)

        expect(component.find('.blank-state-message')).toIncludeText('Done!')
    })

    it('more than 500 tickets closed', () => {
        const component = shallow(<BlankState totalClosedTickets={501} />)

        expect(component.find('.blank-state-message')).toIncludeText(
            'All good!'
        )
    })
})
