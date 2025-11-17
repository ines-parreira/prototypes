import { walkVisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.model'
import type { MultipleChoicesNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { visualBuilderGraphSimpleChoicesFixture } from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import { choicesReducer } from '../choicesReducer'

describe('choicesReducer', () => {
    test('SET_MULTIPLE_CHOICES_CONTENT', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'SET_MULTIPLE_CHOICES_CONTENT',
            multipleChoicesNodeId: 'multiple_choices1',
            content: {
                html: 'new html',
                text: 'new text',
            },
        })
        expect(
            nextG.nodes.find(
                (n): n is MultipleChoicesNodeType =>
                    n.type === 'multiple_choices',
            )?.data.content,
        ).toEqual({
            html: 'new html',
            text: 'new text',
        })
    })

    test('INSERT_MULTIPLE_CHOICES_NODE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'INSERT_MULTIPLE_CHOICES_NODE',
            beforeNodeId: 'multiple_choices1',
        })
        // walk the graph depth-first and check the ordered ids
        const walkedNodes: { id: string; type: string | undefined }[] = []
        walkVisualBuilderGraph(nextG, nextG.nodes[0].id, ({ id, type }) => {
            walkedNodes.push({ id, type })
        })
        expect(walkedNodes).toEqual([
            {
                id: 'trigger_button1',
                type: 'channel_trigger',
            },
            {
                id: expect.any(String),
                type: 'multiple_choices',
            },
            {
                id: 'multiple_choices1',
                type: 'multiple_choices',
            },
            {
                id: 'automated_message1',
                type: 'automated_message',
            },
            {
                id: 'end1',
                type: 'end',
            },
            {
                id: 'automated_message2',
                type: 'automated_message',
            },
            {
                id: 'end2',
                type: 'end',
            },
            {
                id: 'text_reply1',
                type: 'text_reply',
            },
            {
                id: 'file_upload1',
                type: 'file_upload',
            },
            {
                id: 'end3',
                type: 'end',
            },
            // the inserted multiple choices has created a new ending branch
            {
                id: expect.any(String),
                type: 'end',
            },
        ])
    })

    test('ADD_MULTIPLE_CHOICES_CHOICE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'ADD_MULTIPLE_CHOICES_CHOICE',
            multipleChoicesNodeId: 'multiple_choices1',
        })
        // now there are 5 ending branches
        expect(nextG.nodes.filter((n) => n.type === 'end').length).toEqual(5)
        // and 4 edges starting from the multiple_choices node
        const choicesOutgoingEdges = nextG.edges.filter(
            (e) => e.source === 'multiple_choices1',
        )
        expect(choicesOutgoingEdges.length).toEqual(4)
        expect(choicesOutgoingEdges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: {
                        event: {
                            kind: 'choices',
                            id: 'eventId1',
                        },
                    },
                }),
                expect.objectContaining({
                    data: {
                        event: {
                            kind: 'choices',
                            id: 'eventId2',
                        },
                    },
                }),
                expect.objectContaining({
                    data: {
                        event: {
                            kind: 'choices',
                            id: 'eventId3',
                        },
                    },
                }),
                expect.objectContaining({
                    data: {
                        event: {
                            kind: 'choices',
                            id: expect.any(String),
                        },
                    },
                }),
            ]),
        )
    })

    test('DELETE_MULTIPLE_CHOICES_CHOICE', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'DELETE_MULTIPLE_CHOICES_CHOICE',
            nodeId: 'multiple_choices1',
            eventId: 'eventId1',
        })
        // walk the graph depth-first and check the ordered ids
        const walkedNodesIds: string[] = []
        walkVisualBuilderGraph(nextG, nextG.nodes[0].id, ({ id }) => {
            walkedNodesIds.push(id)
        })
        expect(walkedNodesIds).toEqual([
            'trigger_button1',
            'multiple_choices1',
            'automated_message2',
            'end2',
            'text_reply1',
            'file_upload1',
            'end3',
        ])
    })

    test('REORDER_CHOICES', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'REORDER_CHOICES',
            multipleChoicesNodeId: 'multiple_choices1',
            orderedEventIds: ['eventId2', 'eventId1', 'eventId3'],
        })
        // walk the graph depth-first and check the ordered ids
        const walkedNodesIds: string[] = []
        walkVisualBuilderGraph(nextG, nextG.nodes[0].id, ({ id }) => {
            walkedNodesIds.push(id)
        })
        expect(walkedNodesIds).toEqual([
            'trigger_button1',
            'multiple_choices1',
            'automated_message2',
            'end2',
            'automated_message1',
            'end1',
            'text_reply1',
            'file_upload1',
            'end3',
        ])
    })

    test('SET_CHOICE_LABEL', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'SET_CHOICE_LABEL',
            multipleChoicesNodeId: 'multiple_choices1',
            label: 'new choice label',
            eventId: 'eventId1',
        })
        expect(
            nextG.nodes.find(
                (n): n is MultipleChoicesNodeType =>
                    n.id === 'multiple_choices1',
            )?.data.choices,
        ).toEqual([
            {
                event_id: 'eventId1',
                label: 'new choice label',
            },
            {
                event_id: 'eventId2',
                label: 'choice 2',
            },
            {
                event_id: 'eventId3',
                label: 'choice 3',
            },
        ])
    })

    test('GREY_OUT_CHOICE_CHILDREN', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const nextG = choicesReducer(g, {
            type: 'GREY_OUT_CHOICE_CHILDREN',
            isGreyedOut: true,
            multipleChoicesNodeId: 'multiple_choices1',
            eventId: 'eventId1',
        })
        const greyedOutIds: string[] = []
        const notGreyedOutIds: string[] = []
        walkVisualBuilderGraph(nextG, nextG.nodes[0].id, (n) => {
            if (n.data.isGreyedOut) {
                greyedOutIds.push(n.id)
            } else {
                notGreyedOutIds.push(n.id)
            }
        })
        expect(greyedOutIds).toEqual(['automated_message1', 'end1'])
        expect(notGreyedOutIds).toEqual([
            'trigger_button1',
            'multiple_choices1',
            'automated_message2',
            'end2',
            'text_reply1',
            'file_upload1',
            'end3',
        ])
    })
})
