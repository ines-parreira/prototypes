import {visualBuilderGraphSimpleChoicesFixture} from 'pages/automation/workflows/tests/visualBuilderGraph.fixtures'
import {
    AutomatedMessageNodeType,
    TriggerButtonNodeType,
} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import {baseReducer} from '../baseReducer'

describe('baseReducer', () => {
    test('SET_TRIGGER_BUTTON_LABEL', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_TRIGGER_BUTTON_LABEL',
            triggerButtonNodeId: 'trigger_button1',
            label: 'new entrypoint',
        })
        expect(
            nextG.nodes.find(
                (n): n is TriggerButtonNodeType => n.type === 'trigger_button'
            )?.data.label
        ).toEqual('new entrypoint')
    })

    test('SET_AUTOMATED_MESSAGE_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: 'automated_message1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is AutomatedMessageNodeType =>
                    n.id === 'automated_message1'
            )?.data.content
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            })
        )
    })

    test('INSERT_AUTOMATED_MESSAGE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_AUTOMATED_MESSAGE_NODE',
            beforeNodeId: 'automated_message1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new automated_message node has empty text
        expect(
            nextG.nodes
                .filter(
                    (n): n is AutomatedMessageNodeType =>
                        n.type === 'automated_message'
                )
                .find(
                    (n) =>
                        n.data.content.text === '' && n.data.content.html === ''
                )
        ).toBeDefined()
    })

    test('DELETE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_message1',
        })
        // there should be one less node and one less edge
        expect(g.nodes.length).toEqual(nextG.nodes.length + 1)
        expect(g.edges.length).toEqual(nextG.edges.length + 1)
        // the end node previously attached to the deleted node should be attached to the new one
        // and the initial ordering is preserved
        expect(
            nextG.edges
                .filter((e) => e.source === 'multiple_choices1')
                .map((e) => e.target)
        ).toEqual(['end1', 'automated_message2'])
    })

    test('DELETE_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_message1',
        })
        // there should be one less node and one less edge
        expect(g.nodes.length).toEqual(nextG.nodes.length + 1)
        expect(g.edges.length).toEqual(nextG.edges.length + 1)
        // the end node previously attached to the deleted node should be attached to the new one
        // and the initial ordering is preserved
        expect(
            nextG.edges
                .filter((e) => e.source === 'multiple_choices1')
                .map((e) => e.target)
        ).toEqual(['end1', 'automated_message2'])
    })

    test('GREY_OUT_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'GREY_OUT_BRANCH',
            nodeId: 'multiple_choices1',
            isGreyedOut: true,
        })
        // all nodes except the trigger button should be greyed out
        expect(
            nextG.nodes
                .filter((n) => n.type === 'trigger_button')
                .every((n) => !n.data.isGreyedOut)
        ).toBe(true)
        expect(
            nextG.nodes
                .filter((n) => n.type !== 'trigger_button')
                .every((n) => n.data.isGreyedOut)
        ).toBe(true)
    })
})
