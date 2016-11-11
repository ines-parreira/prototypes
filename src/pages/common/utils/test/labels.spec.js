import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'
import * as labels from '../labels'

expect.extend(expectImmutable)

describe('components utils : labels', () => {
    describe('RenderLabel', () => {
        describe('distribution', () => {
            [
                {
                    type: 'address',
                    value: 'localhost',
                    expected: 'localhost'
                },
                {
                    type: 'plain',
                    value: 'hello',
                    expected: 'hello'
                },
                {
                    type: 'composite',
                    value: 'hello',
                    expected: 'hello'
                },
                {
                    type: 'tags',
                    value: {
                        name: 'help'
                    },
                    expected: <labels.TagLabel tag={{name: 'help'}} />
                },
                {
                    type: 'datetime',
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
                    type: 'agent',
                    value: {
                        name: 'Mario'
                    },
                    expected: <labels.AgentLabel name="Mario" />
                },
                {
                    type: 'user',
                    value: {
                        name: 'Luigi'
                    },
                    expected: <labels.UserLabel user={{name: 'Luigi'}} />
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
                    type: element.type
                }, element.value)

                // if renderedComponent is an element, let's render it with the TestUtils renderer
                let rendered

                if (TestUtils.isElement(renderedComponent)) {
                    renderer.render(
                        renderedComponent
                    )

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
