import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'
import { fromJS } from 'immutable'

import {TicketTags} from '../TicketTags'

expect.extend(expectImmutable)

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

    before('render element', () => {
        const renderer = TestUtils.createRenderer()

        renderer.render(
            <TicketTags
                tags={tags}
                ticketTags={ticketTags}
                addTag={() => {}}
                removeTag={() => {}}
            />
        )

        component = renderer.getRenderOutput()
    })

    it('should display current tags', () => {
        const ticketTagsList = component.props.children[0]
        expect(ticketTagsList.size).toBe(ticketTags.size)
    })
})
