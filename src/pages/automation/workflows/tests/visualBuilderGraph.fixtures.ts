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
            id: 'multiple_choices1',
            type: 'multiple_choices',
            data: {
                content: {
                    html: 'html',
                    text: 'text',
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
                ],
                wfConfigurationRef: {
                    wfConfigurationMessagesStepId: 'messages1',
                    wfConfigurationChoicesStepId: 'choices1',
                },
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
                wfConfigurationRef: {
                    wfConfigurationMessagesStepId: 'messages2',
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
                wfConfigurationRef: {
                    wfConfigurationMessagesStepId: 'messages3',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end1',
            type: 'end',
            data: {
                wfConfigurationRef: {
                    wfConfigurationWorkflowCallStepId: 'workflowCall1',
                },
            },
        },
        {
            ...buildNodeCommonProperties(),
            id: 'end2',
            type: 'end',
            data: {
                wfConfigurationRef: {
                    wfConfigurationWorkflowCallStepId: 'workflowCall2',
                },
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
    ],
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
                kind: 'messages',
                settings: {messages: [{content: {html: '', text: ''}}]},
            },
        ],
        transitions: [],
    },
}
