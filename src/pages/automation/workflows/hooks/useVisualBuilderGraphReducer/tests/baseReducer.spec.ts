import {visualBuilderGraphSimpleChoicesFixture} from 'pages/automation/workflows/tests/visualBuilderGraph.fixtures'
import {
    AutomatedAnswerNodeType,
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

    test('SET_AUTOMATED_ANSWER_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_AUTOMATED_ANSWER_CONTENT',
            automatedAnswerNodeId: 'automated_answer1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is AutomatedAnswerNodeType =>
                    n.id === 'automated_answer1'
            )?.data.content
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            })
        )
    })

    test('INSERT_AUTOMATED_ANSWER_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_AUTOMATED_ANSWER_NODE',
            beforeNodeId: 'automated_answer1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new automated_answer node has empty text
        expect(
            nextG.nodes
                .filter(
                    (n): n is AutomatedAnswerNodeType =>
                        n.type === 'automated_answer'
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
            nodeId: 'automated_answer1',
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
        ).toEqual(['end1', 'automated_answer2'])
    })

    test('DELETE_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'DELETE_NODE',
            nodeId: 'automated_answer1',
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
        ).toEqual(['end1', 'automated_answer2'])
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
