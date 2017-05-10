import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import * as labels from '../labels'

/* DatetimeLabel uses Math.random.
 * Mock it to always return the same data.
 */
const mockMath = Object.create(global.Math)
mockMath.random = () => 1
global.Math = mockMath

describe('components utils : labels', () => {
    describe('RenderLabel', () => {
        describe('distribution', () => {
            [
                {
                    type: 'tags',
                    value: 'help',
                    expected: <labels.TagLabel>help</labels.TagLabel>
                },
                {
                    type: 'created',
                    value: '2016-01-15',
                    expected: <labels.DatetimeLabel dateTime="2016-01-15" />
                },
                {
                    type: 'status',
                    value: 'open',
                    expected: <labels.StatusLabel status="open" />
                },
                {
                    type: 'priority',
                    value: 'high',
                    expected: <labels.PriorityLabel priority="high" />
                },
                {
                    type: 'assignee',
                    value: {
                        name: 'Mario'
                    },
                    expected: <labels.AgentLabel name="Mario" />
                },
                {
                    type: 'requester',
                    value: {
                        name: 'Luigi'
                    },
                    expected: <labels.UserLabel name="Luigi" />
                },
                {
                    type: 'channel',
                    value: 'email',
                    expected: <labels.ChannelLabel channel="email" />
                },
                {
                    type: 'thisshouldreturnnull',
                    value: undefined,
                    expected: null
                }
            ].forEach(element => {
                const renderedComponent = labels.RenderLabel({
                    field: fromJS({name: element.type}),
                    value: fromJS(element.value),
                })

                // if renderedComponent is an element, shallow render it
                let rendered

                if (React.isValidElement(renderedComponent)) {
                    rendered = shallow(renderedComponent)
                } else {
                    rendered = renderedComponent
                }

                let expected

                it(`${element.type} label`, () => {
                    // if the expected result is an element, shallow render it
                    if (React.isValidElement(element.expected)) {
                        expected = shallow(element.expected)

                        expect(rendered).toEqual(expected)
                    } else {
                        expected = element.expected

                        expect(rendered).toBe(expected)
                    }
                })
            })
        })
    })
})
