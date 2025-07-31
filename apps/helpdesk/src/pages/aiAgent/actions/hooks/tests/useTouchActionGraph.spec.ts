import { renderHook } from '@repo/testing'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import useTouchActionGraph from '../useTouchActionGraph'

describe('useTouchActionGraph()', () => {
    it('should touch action graph', () => {
        const { result } = renderHook(() =>
            useTouchActionGraph([
                {
                    id: 'app_id',
                    auth_type: 'api-key',
                    auth_settings: {},
                },
            ]),
        )

        expect(
            result.current({
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
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: '',
                            requires_confirmation: false,
                            inputs: [
                                {
                                    id: 'someid',
                                    name: 'some name',
                                    instructions: 'some instructions',
                                    data_type: 'string',
                                },
                            ],
                            conditionsType: 'and',
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
                        id: 'conditions1',
                        type: 'conditions',
                        data: {
                            name: 'conditions1',
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
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                apps: [
                    {
                        app_id: 'app_id',
                        api_key: 'api_key',
                        type: 'app',
                    },
                ],
            }),
        ).toEqual(
            expect.objectContaining({
                nodes: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            touched: {
                                conditions: {},
                                inputs: {
                                    someid: {
                                        instructions: true,
                                        name: true,
                                    },
                                },
                                instructions: true,
                            },
                        }),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
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
                        }),
                        id: 'http_request1',
                        type: 'http_request',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            touched: {
                                branches: {
                                    conditions1_branch1: {
                                        conditions: {},
                                        name: true,
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
                ],
                apps: [
                    expect.objectContaining({
                        app_id: 'app_id',
                        type: 'app',
                        touched: {
                            api_key: true,
                        },
                    }),
                ],
                touched: {
                    name: true,
                    nodes: true,
                },
            }),
        )
    })
})
