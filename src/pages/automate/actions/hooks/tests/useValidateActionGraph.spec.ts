import {renderHook} from '@testing-library/react-hooks'

import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from 'pages/automate/workflows/models/visualBuilderGraph.model'

import useValidateActionGraph from '../useValidateActionGraph'

describe('useValidateActionGraph()', () => {
    it('should validate action graph', () => {
        const {result} = renderHook(() => useValidateActionGraph(() => [], []))

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
                                    name: '',
                                    instructions: '',
                                    data_type: 'string',
                                },
                            ],
                            conditionsType: 'and',
                            conditions: [],
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
                        },
                    },
                    {
                        ...buildNodeCommonProperties(),
                        id: 'http_request1',
                        type: 'http_request',
                        data: {
                            name: '',
                            url: '',
                            method: 'GET',
                            headers: [],
                            variables: [
                                {
                                    id: 'variable1',
                                    name: '',
                                    jsonpath: '',
                                    data_type: 'json',
                                },
                                {
                                    id: 'variable2',
                                    name: '',
                                    jsonpath: '',
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
                            conditions: {and: []},
                        },
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                touched: {
                    name: true,
                    nodes: true,
                },
                apps: [
                    {
                        app_id: 'someid',
                        type: 'app',
                        api_key: '',
                        touched: {
                            api_key: true,
                        },
                    },
                ],
            })
        ).toEqual(
            expect.objectContaining({
                nodes: [
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                conditions:
                                    'Add conditions or select "No conditions required"',
                                inputs: {
                                    someid: {
                                        instructions: 'Description is required',
                                        name: 'Name is required',
                                    },
                                },
                                instructions: 'Description is required',
                            },
                        }),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                    }),
                    expect.objectContaining({
                        data: expect.objectContaining({
                            errors: {
                                name: 'Request name is required',
                                url: 'URL is required',
                                variables: {
                                    0: {
                                        jsonpath: 'JSONPath is required',
                                        name: 'Name is required',
                                    },
                                    1: {
                                        jsonpath: 'JSONPath is required',
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
                ],
                apps: [
                    expect.objectContaining({
                        app_id: 'someid',
                        type: 'app',
                        errors: {
                            api_key: 'API key is required',
                        },
                    }),
                ],
                errors: {
                    name: 'Action name is required',
                },
            })
        )
    })

    it('should validate unique Action graph name', () => {
        const {result} = renderHook(() =>
            useValidateActionGraph(() => [], [{id: 'someid', name: 'test'}])
        )

        expect(
            result.current({
                id: '',
                internal_id: '',
                is_draft: false,
                isTemplate: false,
                name: 'test',
                available_languages: [],
                nodes: [
                    {
                        ...buildNodeCommonProperties(),
                        id: 'trigger',
                        type: 'llm_prompt_trigger',
                        data: {
                            instructions: '',
                            requires_confirmation: false,
                            inputs: [],
                            conditionsType: null,
                            conditions: [],
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
                        target: 'end1',
                    },
                ],
                nodeEditingId: null,
                choiceEventIdEditing: null,
                branchIdsEditing: [],
                touched: {
                    name: true,
                },
                apps: [],
            })
        ).toEqual(
            expect.objectContaining({
                errors: {
                    name: 'An Action already exists with this name',
                },
            })
        )
    })
})
