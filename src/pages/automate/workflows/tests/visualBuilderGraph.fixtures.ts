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
            type: 'channel_trigger',
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
    nodeEditingId: null,
    choiceEventIdEditing: null,
    branchIdsEditing: [],
}

export const visualBuilderGraphLlmPromptTriggerFixture: VisualBuilderGraph = {
    name: 'Remove order item',
    available_languages: ['en-US'],
    nodes: [
        {
            ...buildNodeCommonProperties(),
            id: 'trigger',
            type: 'llm_prompt_trigger',
            data: {
                instructions: 'Instructions',
                requires_confirmation: false,
                inputs: [
                    {
                        id: 'someid',
                        name: 'some name',
                        instructions: 'some instructions',
                        data_type: 'string',
                    },
                ],
                conditionsType: null,
                conditions: [],
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'http_request1',
            type: 'http_request',
            data: {
                name: '',
                url: 'https://example.com',
                method: 'GET',
                headers: [],
                variables: [
                    {
                        id: 'variable1',
                        name: '',
                        jsonpath: '$',
                        data_type: 'json',
                    },
                    {
                        id: 'variable2',
                        name: '',
                        jsonpath: '$.string',
                        data_type: 'string',
                    },
                ],
                json: null,
                formUrlencoded: null,
                bodyContentType: null,
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end1',
            type: 'end',
            data: {
                action: 'end',
            },
        },
    ],
    edges: [
        {
            ...buildEdgeCommonProperties(),
            source: 'trigger',
            target: 'http_request1',
        },
        {
            ...buildEdgeCommonProperties(),
            source: 'http_request1',
            target: 'end1',
        },
    ],
    wfConfigurationOriginal: {
        internal_id: 'id_2',
        id: 'id_2',
        name: 'Llm prompt trigger configuration',
        is_draft: false,
        initial_step_id: 'trigger',
        entrypoint: null,
        available_languages: [],
        steps: [],
        transitions: [],
        updated_datetime: '2024-09-17T11:18:00.201Z',
        triggers: [],
        entrypoints: [],
        apps: [],
    },
    nodeEditingId: null,
    choiceEventIdEditing: null,
    branchIdsEditing: [],
}

export const visualBuilderGraphReusableLLMPromptTriggerFixture: VisualBuilderGraph =
    {
        name: 'Remove order item',
        available_languages: ['en-US'],
        nodes: [
            {
                ...buildNodeCommonProperties(),
                id: 'trigger',
                type: 'reusable_llm_prompt_trigger',
                data: {
                    requires_confirmation: false,
                    inputs: [
                        {
                            id: 'someid',
                            name: 'some name',
                            instructions: 'some instructions',
                            data_type: 'string',
                        },
                    ],
                    conditionsType: null,
                    conditions: [],
                },
            },
            {
                ...buildNodeCommonProperties(),
                id: 'http_request1',
                type: 'http_request',
                data: {
                    name: '',
                    url: 'https://example.com',
                    method: 'GET',
                    headers: [],
                    variables: [
                        {
                            id: 'variable1',
                            name: '',
                            jsonpath: '$',
                            data_type: 'json',
                        },
                        {
                            id: 'variable2',
                            name: '',
                            jsonpath: '$.string',
                            data_type: 'string',
                        },
                    ],
                    json: null,
                    formUrlencoded: null,
                    bodyContentType: null,
                },
            },
            {
                ...buildNodeCommonProperties(),
                id: 'end1',
                type: 'end',
                data: {
                    action: 'end',
                },
            },
        ],
        edges: [
            {
                ...buildEdgeCommonProperties(),
                source: 'trigger',
                target: 'http_request1',
            },
            {
                ...buildEdgeCommonProperties(),
                source: 'http_request1',
                target: 'end1',
            },
        ],
        wfConfigurationOriginal: {
            internal_id: 'id_2',
            id: 'id_2',
            name: 'Reusable LLM prompt trigger configuration',
            is_draft: false,
            initial_step_id: 'trigger',
            entrypoint: null,
            available_languages: [],
            steps: [],
            transitions: [],
            updated_datetime: '2024-09-17T11:18:00.201Z',
            triggers: [],
            entrypoints: [],
            apps: [],
        },
        nodeEditingId: null,
        choiceEventIdEditing: null,
        branchIdsEditing: [],
    }
