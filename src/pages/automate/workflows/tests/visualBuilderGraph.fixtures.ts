import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from '../models/visualBuilderGraph.model'
import {VisualBuilderGraph} from '../models/visualBuilderGraph.types'

export const visualBuilderGraphSimpleChoicesFixture: VisualBuilderGraph = {
    name: 'name',
    nodes: [
        {
            ...buildNodeCommonProperties(),
            id: 'trigger_button1',
            type: 'trigger_button',
            data: {
                label: 'entrypoint',
                label_tkey: 'entrypoint_tkey',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'conditions1',
            type: 'conditions',
            data: {
                name: 'conditions1',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'conditions_end1',
            type: 'end',
            data: {
                action: 'ask-for-feedback',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'multiple_choices1',
            type: 'multiple_choices',
            data: {
                content: {
                    html: 'Choices html',
                    text: 'Choices text',
                },
                choices: [
                    {
                        label: 'choice 1',
                        event_id: 'eventId1',
                    },
                    {
                        label: 'choice 2',
                        event_id: 'eventId2',
                    },
                    {
                        label: 'choice 3',
                        event_id: 'eventId3',
                    },
                ],
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'automated_message1',
            type: 'automated_message',
            data: {
                content: {
                    html: 'html',
                    text: 'text',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'automated_message2',
            type: 'automated_message',
            data: {
                content: {
                    html: 'html',
                    text: 'text',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'text_reply1',
            type: 'text_reply',
            data: {
                content: {
                    html: 'Text reply html',
                    text: 'Text reply text',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'file_upload1',
            type: 'file_upload',
            data: {
                content: {
                    html: 'html',
                    text: 'text',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end1',
            type: 'end',
            data: {
                action: 'ask-for-feedback',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end2',
            type: 'end',
            data: {
                action: 'ask-for-feedback',
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end3',
            type: 'end',
            data: {
                action: 'ask-for-feedback',
            },
        },
    ],
    edges: [
        {
            ...buildEdgeCommonProperties(),
            id: 'trigger_button1_multiple_choices1',
            source: 'trigger_button1',
            target: 'multiple_choices1',
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'conditions1_branch1',
            source: 'conditions1',
            target: 'conditions_end1',
            data: {
                conditions: {
                    and: [
                        {
                            equals: [
                                {
                                    var: 'steps_state.multiple_choices1.content.text',
                                },
                                'choice 1',
                            ],
                        },
                    ],
                },
            },
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'multiple_choices1_automated_message1',
            source: 'multiple_choices1',
            target: 'automated_message1',
            data: {
                event: {
                    id: 'eventId1',
                    kind: 'choices',
                },
            },
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'multiple_choices1_automated_message2',
            source: 'multiple_choices1',
            target: 'automated_message2',
            data: {
                event: {
                    id: 'eventId2',
                    kind: 'choices',
                },
            },
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'multiple_choices1_text_reply1',
            source: 'multiple_choices1',
            target: 'text_reply1',
            data: {
                event: {
                    id: 'eventId3',
                    kind: 'choices',
                },
            },
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'text_reply1_file_upload1',
            source: 'text_reply1',
            target: 'file_upload1',
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'automated_message1_end1',
            source: 'automated_message1',
            target: 'end1',
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'automated_message2_end2',
            source: 'automated_message2',
            target: 'end2',
        },
        {
            ...buildEdgeCommonProperties(),
            id: 'file_upload1_end3',
            source: 'file_upload1',
            target: 'end3',
        },
    ],
    available_languages: ['en-US'],
    wfConfigurationOriginal: {
        id: '1',
        account_id: 1,
        is_draft: false,
        name: 'my workflow',
        internal_id: '1',
        initial_step_id: 'messages1',
        steps: [
            {
                id: 'messages1',
                kind: 'message',
                settings: {message: {content: {html: '', text: ''}}},
            },
        ],
        transitions: [],
        available_languages: ['en-US'],
    },
}
