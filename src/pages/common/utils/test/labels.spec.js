import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import {fromJS} from 'immutable'
import expectImmutable from 'expect-immutable'
import * as labels from '../labels'

expect.extend(expectImmutable)

describe('components utils : labels', () => {
    describe('RenderLabel', () => {
        describe('distribution', () => {
            [
                {
                    type: 'tags',
                    value: 'help',
                    expected: <labels.TagLabel name="help" />
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
                const renderer = TestUtils.createRenderer()

                const renderedComponent = labels.RenderLabel({
                    field: fromJS({name: element.type}),
                    value: fromJS(element.value),
                })

                // if renderedComponent is an element, let's render it with the TestUtils renderer
                let rendered

                if (TestUtils.isElement(renderedComponent)) {
                    renderer.render(renderedComponent)

                    rendered = renderer.getRenderOutput()
                } else {
                    rendered = renderedComponent
                }

                let expected

                // if the expected result is an element, let's render it with the TestUtils renderer
                if (TestUtils.isElement(element.expected)) {
                    renderer.render(
                        element.expected
                    )

                    expected = renderer.getRenderOutput()

                    expect(rendered).toEqual(expected)
                } else {
                    expected = element.expected

                    expect(rendered).toBe(expected)
                }
            })
        })
    })
})
