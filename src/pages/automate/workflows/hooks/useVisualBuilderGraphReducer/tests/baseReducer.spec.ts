import {visualBuilderGraphSimpleChoicesFixture} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'
import {
    AutomatedMessageNodeType,
    ChannelTriggerNodeType,
    FileUploadNodeType,
    TextReplyNodeType,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {baseReducer} from '../baseReducer'

describe('baseReducer', () => {
    test('SET_CHANNEL_TRIGGER_LABEL', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_CHANNEL_TRIGGER_LABEL',
            channelTriggerNodeId: 'trigger_button1',
            label: 'new entrypoint',
        })
        expect(
            nextG.nodes.find(
                (n): n is ChannelTriggerNodeType => n.type === 'channel_trigger'
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

    test('SET_TEXT_REPLY_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_TEXT_REPLY_CONTENT',
            textReplyNodeId: 'text_reply1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is TextReplyNodeType => n.id === 'text_reply1'
            )?.data.content
        ).toEqual(
            expect.objectContaining({
                html: 'new html',
                text: 'new text',
            })
        )
    })

    test('SET_FILE_UPLOAD_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'SET_FILE_UPLOAD_CONTENT',
            fileUploadNodeId: 'file_upload1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is FileUploadNodeType => n.id === 'file_upload1'
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

    test('INSERT_TEXT_REPLY_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_TEXT_REPLY_NODE',
            beforeNodeId: 'text_reply1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new node has empty text
        expect(
            nextG.nodes
                .filter((n): n is TextReplyNodeType => n.type === 'text_reply')
                .find(
                    (n) =>
                        n.data.content.text === '' && n.data.content.html === ''
                )
        ).toBeDefined()
    })

    test('INSERT_FILE_UPLOAD_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'INSERT_FILE_UPLOAD_NODE',
            beforeNodeId: 'file_upload1',
        })
        // there should be one more node and one more edge
        expect(g.nodes.length).toEqual(nextG.nodes.length - 1)
        expect(g.edges.length).toEqual(nextG.edges.length - 1)
        // the new node has empty text
        expect(
            nextG.nodes
                .filter(
                    (n): n is FileUploadNodeType => n.type === 'file_upload'
                )
                .find(
                    (n) =>
                        n.data.content.text === '' && n.data.content.html === ''
                )
        ).toBeDefined()
    })

    test('DELETE_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture

        expect(
            g.edges.filter((e) => {
                const conditions =
                    e.data?.conditions?.and ?? e.data?.conditions?.or ?? []
                return Object.keys(conditions).length > 0
            })
        ).toHaveLength(1)

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
        ).toEqual(['end1', 'automated_message2', 'text_reply1'])
        expect(
            nextG.edges.filter((e) => {
                const conditions =
                    e.data?.conditions?.and ?? e.data?.conditions?.or ?? []
                return Object.keys(conditions).length > 0
            })
        ).toHaveLength(0)
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
        ).toEqual(['end1', 'automated_message2', 'text_reply1'])
    })

    test('GREY_OUT_BRANCH', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = baseReducer(g, {
            type: 'GREY_OUT_BRANCH',
            nodeId: 'multiple_choices1',
            isGreyedOut: true,
        })
        // all nodes except the trigger button + conditions should be greyed out
        expect(nextG.nodes.slice(0, 2).every((n) => !n.data.isGreyedOut)).toBe(
            true
        )

        expect(nextG.nodes.slice(3).every((n) => n.data.isGreyedOut)).toBe(true)
    })
})
