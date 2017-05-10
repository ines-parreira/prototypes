import React from 'react'
import {shallow} from 'enzyme'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'

import {TicketTags} from '../TicketTags'

describe('TicketTags component', () => {
    let component

    const tags = [
        { name: 'tag1' },
        { name: 'tag2' },
        { name: 'tag3' },
        { name: 'tag4' },
        { name: 'tag5' }
    ]

    const ticketTags = fromJS([
        { name: 'tag1' },
        { name: 'tag5' }
    ])

    beforeAll(() => {
        component = shallow(
            <TicketTags
                tags={tags}
                ticketTags={ticketTags}
                addTags={_noop}
                removeTag={_noop}
                fieldEnumSearch={_noop}
            />
        )
    })

    it('should display current tags', () => {
        expect(component.children().length - 1).toBe(ticketTags.size)
    })
})
