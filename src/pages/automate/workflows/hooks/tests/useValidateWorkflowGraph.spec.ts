import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import { renderHook } from 'utils/testing/renderHook'

import useValidateWorkflowGraph from '../useValidateWorkflowGraph'

describe('useValidateWorkflowGraph()', () => {
    it('should validate workflow graph', () => {
        const { result } = renderHook(() => useValidateWorkflowGraph(() => []))

        expect(
            result.current(
                {
                    id: '',
                    internal_id: '',
                    is_draft: false,
                    isTemplate: false,
                    name: '',
                    available_languages: [],
                    nodes: [
                        {
                            ...buildNodeCommonProperties(),
                            id: 'trigger',
                            type: 'channel_trigger',
                            data: {
                                label: '',
                                label_tkey: '',
                                touched: {
                                    label: true,
                                },
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
                                touched: {
                                    headers: {},
                                    json: true,
                                    name: true,
                                    url: true,
                                    variables: {
                                        '0': {
                                            jsonpath: true,
                                            name: true,
                                        },
                                        '1': {
                                            jsonpath: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'conditions1',
                            type: 'conditions',
                            data: {
                                name: 'conditions1',
                                touched: {
                                    branches: {
                                        conditions1_branch1: {
                                            conditions: {},
                                            name: true,
                                        },
                                    },
                                },
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
                        {
                            ...buildNodeCommonProperties(),
                            id: 'automated_message1',
                            type: 'automated_message',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                touched: {
                                    content: true,
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'multiple_choices1',
                            type: 'multiple_choices',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                choices: [{ event_id: 'choice1', label: '' }],
                                touched: {
                                    choices: {
                                        choice1: {
                                            label: true,
                                        },
                                    },
                                    content: true,
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'text_reply1',
                            type: 'text_reply',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                touched: {
                                    content: true,
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'file_upload1',
                            type: 'file_upload',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                touched: {
                                    content: true,
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'order_selection1',
                            type: 'order_selection',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                touched: {
                                    content: true,
                                },
                            },
                        },
                        {
                            ...buildNodeCommonProperties(),
                            id: 'order_line_item_selection1',
                            type: 'order_line_item_selection',
                            data: {
                                content: {
                                    html: '',
                                    text: '',
                                },
                                touched: {
                                    content: true,
                                },
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
                            target: 'conditions1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            id: 'conditions1_branch1',
                            source: 'conditions1',
                            target: 'end1',
                            data: {
                                conditions: { and: [] },
                            },
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'conditions1',
                            target: 'automated_message1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'automated_message1',
                            target: 'multiple_choices1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'multiple_choices1',
                            target: 'text_reply1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'text_reply1',
                            target: 'file_upload1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'file_upload1',
                            target: 'order_selection1',
                        },
                        {
                            ...buildEdgeCommonProperties(),
                            source: 'order_selection1',
                            target: 'order_line_item_selection',
                        },
                    ],
                    nodeEditingId: null,
                    choiceEventIdEditing: null,
                    branchIdsEditing: [],
                },
                false,
            ),
        ).toEqual(
            expect.objectContaining({
                nodes: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                label: 'Trigger button is required',
                            },
                        }),
                        id: 'trigger',
                        type: 'channel_trigger',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                name: 'Request name is required',
                                variables: {
                                    '0': {
                                        name: 'Name is required',
                                    },
                                    '1': {
                                        name: 'Name is required',
                                    },
                                },
                            },
                        }),
                        id: 'http_request1',
                        type: 'http_request',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                branches: {
                                    conditions1_branch1: {
                                        conditions:
                                            'A branch must have at least 1 condition',
                                        name: 'Name is required',
                                    },
                                },
                            },
                        }),
                        id: 'conditions1',
                        type: 'conditions',
                    }),
                    expect.objectContaining({
                        id: 'end1',
                        type: 'end',
                    }),
                    expect.objectContaining({
                        type: 'automated_message',
                        data: expect.objectContaining({
                            errors: {
                                content: 'Message is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        type: 'multiple_choices',
                        data: expect.objectContaining({
                            errors: {
                                choices: {
                                    choice1: {
                                        label: 'Option label is required',
                                    },
                                },
                                content: 'Question is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        type: 'text_reply',
                        data: expect.objectContaining({
                            errors: {
                                content: 'Message is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        type: 'file_upload',
                        data: expect.objectContaining({
                            errors: {
                                content: 'Message is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        type: 'order_selection',
                        data: expect.objectContaining({
                            errors: {
                                content: 'Message is required',
                            },
                        }),
                    }),
                    expect.objectContaining({
                        type: 'order_line_item_selection',
                        data: expect.objectContaining({
                            errors: {
                                content: 'Message is required',
                            },
                        }),
                    }),
                ],
                errors: {
                    name: 'You must add a flow name in order to save',
                },
            }),
        )
    })
})
