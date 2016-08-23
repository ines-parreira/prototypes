import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'
import { fromJS } from 'immutable'

import TicketTags from '../TicketTags'

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

    it('should have all tags as options, except those in ticketTags', () => {
        const tagsList = component.props.children[1].props.children[1].props.children[2]
        let actualTagsListLength = 0

        for (const tag of tagsList) {
            if (tag) { // remove 'null' values from the count
                actualTagsListLength += 1
            }
        }

        expect(actualTagsListLength).toBe(tags.length - ticketTags.size)
    })
})
