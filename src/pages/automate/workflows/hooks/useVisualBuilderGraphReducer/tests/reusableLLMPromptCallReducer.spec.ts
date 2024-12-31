import {buildNodeCommonProperties} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {
    LLMPromptTriggerNodeType,
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    visualBuilderGraphLlmPromptTriggerFixture,
    visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
} from 'pages/automate/workflows/tests/visualBuilderGraph.fixtures'

import {
    reusableLLMPromptCallReducer,
    isVisualBuilderReusableLLMPromptCallAction,
    reorderNodes,
} from '../reusableLLMPromptCallReducer'

describe('reusableLLMPromptCallReducer', () => {
    test('isVisualBuilderReusableLLMPromptCallAction validates action types', () => {
        expect(
            isVisualBuilderReusableLLMPromptCallAction({
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            })
        ).toBe(true)
        expect(
            isVisualBuilderReusableLLMPromptCallAction({
                type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE',
            })
        ).toBe(true)
        expect(
            isVisualBuilderReusableLLMPromptCallAction({
                type: 'REUSABLE_LLM_PROMPT_CALL_NODE',
            })
        ).toBe(true)
        expect(
            isVisualBuilderReusableLLMPromptCallAction({type: 'UNKNOWN_ACTION'})
        ).toBe(false)
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE with template', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            isTemplate: true,
            nodeEditingId: null,
        }
        const nextGraph = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app', app_id: 'app123'},
            values: {},
        })

        expect(nextGraph.nodeEditingId).toBeNull()
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE with existing app', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            apps: [{type: 'app' as const, app_id: 'app123'}],
        }
        const nextGraph = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app', app_id: 'app123'},
            values: {},
        })

        expect(nextGraph.apps).toHaveLength(1)
    })

    test('SET_REUSABLE_LLM_PROMPT_CALL_VALUE', () => {
        const nextGraph = reusableLLMPromptCallReducer(
            visualBuilderGraphLLMPromptTriggerWithReusableLLMPromptCallFixture,
            {
                type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE',
                reusableLLMPromptCallNodeId: 'reusable_llm_prompt_call1',
                inputId: 'input1',
                value: 'value1',
            }
        )

        expect(nextGraph.nodes[1].data).toEqual(
            expect.objectContaining({
                values: {
                    input1: 'value1',
                },
            })
        )
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE throws error when trigger node is not llm_prompt_trigger', () => {
        const g: VisualBuilderGraph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'channel_trigger',
                    data: {
                        label: '',
                        label_tkey: '',
                    },
                },
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        }

        expect(() =>
            reusableLLMPromptCallReducer(g, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'http_request1',
                configurationId: 'config123',
                configurationInternalId: 'internal123',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {type: 'app' as const, app_id: 'app123'},
                values: {},
            })
        ).toThrow()
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles existing product input in trigger node', () => {
        const g: VisualBuilderGraph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'llm_prompt_trigger',
                    data: {
                        ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0]
                            .data,
                        inputs: [
                            {
                                id: 'existing-product',
                                name: 'Test name 2',
                                kind: 'product' as const,
                                instructions: 'Test instructions 2',
                            },
                        ],
                    },
                } as LLMPromptTriggerNodeType,
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        }

        const nextG = reusableLLMPromptCallReducer(g, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        id: 'input2',
                        name: 'Test name 2',
                        kind: 'product' as const,
                        instructions: 'Test instructions 2',
                    },
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        // Verify that the existing product input was reused
        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        expect(triggerNode.data.inputs).toHaveLength(1)
        expect(triggerNode.data.inputs[0].id).toBe('existing-product')
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE adds new product input when not found', () => {
        const nextG = reusableLLMPromptCallReducer(
            visualBuilderGraphLlmPromptTriggerFixture,
            {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'http_request1',
                configurationId: 'config123',
                configurationInternalId: 'internal123',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [
                        {
                            id: 'input2',
                            name: 'Test name 2',
                            kind: 'product' as const,
                            instructions: 'Test instructions 2',
                        },
                    ],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {type: 'app' as const, app_id: 'app123'},
                values: {},
            }
        )

        // Verify that a new product input was added
        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        const productInputs = triggerNode.data.inputs.filter(
            (
                input
            ): input is {
                id: string
                name: string
                kind: 'product'
                instructions: string
            } => 'kind' in input && input.kind === 'product'
        )
        expect(productInputs).toHaveLength(1)
        expect(productInputs[0].name).toBe('Test name 2')
        expect(productInputs[0].instructions).toBe('Test instructions 2')
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE sets nodeEditingId and resets branchIdsEditing when app is not template', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            branchIdsEditing: ['branch1', 'branch2'],
            isTemplate: false,
        }

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'end1',
            configurationId: '123',
            configurationInternalId: '456',
            trigger: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {
                type: 'app' as const,
                app_id: '789',
            },
            values: {},
        })

        const newNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(nextG.nodeEditingId).toBe(newNode?.id)
        expect(nextG.branchIdsEditing).toEqual([])
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE sets nodeEditingId and resets branchIdsEditing when values exist', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            branchIdsEditing: ['branch1', 'branch2'],
            isTemplate: true,
        }

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'end1',
            configurationId: '123',
            configurationInternalId: '456',
            trigger: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {
                type: 'shopify' as const,
            },
            values: {
                someValue: 'value',
            },
        })

        const newNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(nextG.nodeEditingId).toBe(newNode?.id)
        expect(nextG.branchIdsEditing).toEqual([])
    })

    describe('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE', () => {
        test('adds app when not present', () => {
            const graph = {
                ...visualBuilderGraphLlmPromptTriggerFixture,
                apps: [],
            }
            const nextG = reusableLLMPromptCallReducer(graph, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'end1',
                configurationId: '123',
                configurationInternalId: '456',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {
                    type: 'app' as const,
                    app_id: '789',
                },
                values: {},
            })

            expect(nextG.apps).toEqual([
                {
                    type: 'app',
                    app_id: '789',
                },
            ])
        })

        test('does not add duplicate app', () => {
            const graph = {
                ...visualBuilderGraphLlmPromptTriggerFixture,
                apps: [
                    {
                        type: 'app' as const,
                        app_id: '789',
                    },
                ],
            }
            const nextG = reusableLLMPromptCallReducer(graph, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'end1',
                configurationId: '123',
                configurationInternalId: '456',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {
                    type: 'app' as const,
                    app_id: '789',
                },
                values: {},
            })

            // Should not add duplicate app
            expect(nextG.apps).toEqual([
                {
                    type: 'app',
                    app_id: '789',
                },
            ])
        })

        test('handles non-app type correctly', () => {
            const graph = {
                ...visualBuilderGraphLlmPromptTriggerFixture,
                apps: [],
            }
            const nextG = reusableLLMPromptCallReducer(graph, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'end1',
                configurationId: '123',
                configurationInternalId: '456',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {
                    type: 'shopify' as const,
                },
                values: {},
            })

            expect(nextG.apps).toEqual([
                {
                    type: 'shopify',
                },
            ])
        })

        test('does not add duplicate non-app type', () => {
            const graph = {
                ...visualBuilderGraphLlmPromptTriggerFixture,
                apps: [
                    {
                        type: 'shopify' as const,
                    },
                ],
            }
            const nextG = reusableLLMPromptCallReducer(graph, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'end1',
                configurationId: '123',
                configurationInternalId: '456',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {
                    type: 'shopify' as const,
                },
                values: {},
            })

            // Should not add duplicate shopify app
            expect(nextG.apps).toEqual([
                {
                    type: 'shopify',
                },
            ])
        })

        test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE adds app with api_key when not present', () => {
            const graph = {
                ...visualBuilderGraphLlmPromptTriggerFixture,
                apps: [],
            }
            const nextG = reusableLLMPromptCallReducer(graph, {
                type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
                beforeNodeId: 'end1',
                configurationId: '123',
                configurationInternalId: '456',
                trigger: {
                    custom_inputs: [],
                    object_inputs: [],
                    outputs: [],
                },
                entrypoint: {
                    requires_confirmation: false,
                },
                app: {
                    type: 'app' as const,
                    app_id: '789',
                    api_key: 'test-key',
                },
                values: {},
            })

            expect(nextG.apps).toEqual([
                {
                    type: 'app',
                    app_id: '789',
                    api_key: 'test-key',
                },
            ])
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE resets branchIdsEditing', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            branchIdsEditing: ['branch1', 'branch2'],
            isTemplate: false,
        }

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'end1',
            configurationId: '123',
            configurationInternalId: '456',
            trigger: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {
                type: 'app' as const,
                app_id: '789',
            },
            values: {
                someValue: 'value',
            },
        })

        expect(nextG.branchIdsEditing).toEqual([])
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles custom inputs correctly', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'llm_prompt_trigger',
                    data: {
                        ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0]
                            .data,
                        inputs: [
                            {
                                id: 'existing-input',
                                name: 'Test Input',
                                instructions: 'Test Instructions',
                                data_type: 'string',
                            },
                        ],
                    },
                } as LLMPromptTriggerNodeType,
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        } as unknown as VisualBuilderGraph

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [
                    {
                        id: 'input1',
                        name: 'Test Input',
                        instructions: 'Test Instructions',
                        data_type: 'string',
                    },
                ],
                object_inputs: [],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        // Verify that the existing input was reused
        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        expect(triggerNode.data.inputs).toHaveLength(1)
        expect(triggerNode.data.inputs[0].id).toBe('existing-input')

        // Verify that the custom input was mapped correctly
        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.custom_inputs).toEqual({
            input1: `{{custom_inputs.existing-input}}`,
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles customer object input', () => {
        const graph = visualBuilderGraphLlmPromptTriggerFixture

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'customer',
                    } as const,
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.objects).toEqual({
            customer: '{{objects.customer}}',
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles order object input', () => {
        const graph = visualBuilderGraphLlmPromptTriggerFixture

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'order',
                    } as const,
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.objects).toEqual({
            order: '{{objects.order}}',
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles product object input with new input', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'llm_prompt_trigger',
                    data: {
                        ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0]
                            .data,
                        inputs: [],
                    },
                } as LLMPromptTriggerNodeType,
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        } as unknown as VisualBuilderGraph

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'product',
                        name: 'Product',
                        instructions: 'Select a product',
                        id: 'product1',
                    } as const,
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        const newInput = triggerNode.data.inputs.find(
            (
                input
            ): input is {
                id: string
                name: string
                instructions: string
                kind: 'product'
            } => 'kind' in input && input.kind === 'product'
        )
        expect(newInput?.kind).toBe('product')
        expect(newInput?.name).toBeDefined()
        expect(newInput?.instructions).toBeDefined()

        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.objects).toEqual({
            products: {
                product1: `{{objects.products.${newInput?.id}}}`,
            },
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles multiple object inputs', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'llm_prompt_trigger',
                    data: {
                        ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0]
                            .data,
                        inputs: [],
                    },
                } as LLMPromptTriggerNodeType,
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        } as unknown as VisualBuilderGraph

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'customer',
                    } as const,
                    {
                        kind: 'order',
                    } as const,
                    {
                        kind: 'product',
                        name: 'Product',
                        instructions: 'Select a product',
                        id: 'product1',
                    } as const,
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        const productInput = triggerNode.data.inputs.find(
            (
                input
            ): input is {
                id: string
                name: string
                instructions: string
                kind: 'product'
            } => 'kind' in input && input.kind === 'product'
        )

        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.objects).toEqual({
            customer: '{{objects.customer}}',
            order: '{{objects.order}}',
            products: {
                product1: `{{objects.products.${productInput?.id}}}`,
            },
        })
    })

    describe('reorderNodes', () => {
        it('correctly reorders nodes and updates their connections', () => {
            const initialGraph = {
                nodes: [
                    {
                        id: 'trigger',
                        type: 'channel_trigger',
                        position: {x: 0, y: 0},
                        data: {},
                    },
                    {
                        id: 'node1',
                        type: 'reusable_llm_prompt_call',
                        position: {x: 0, y: 100},
                        data: {},
                    },
                    {
                        id: 'failure1',
                        type: 'end',
                        position: {x: 100, y: 100},
                        data: {action: 'end-failure'},
                    },
                    {
                        id: 'node2',
                        type: 'reusable_llm_prompt_call',
                        position: {x: 0, y: 200},
                        data: {},
                    },
                    {
                        id: 'failure2',
                        type: 'end',
                        position: {x: 100, y: 200},
                        data: {action: 'end-failure'},
                    },
                    {
                        id: 'success',
                        type: 'end',
                        position: {x: 0, y: 300},
                        data: {action: 'end-success'},
                    },
                ],
                edges: [
                    {
                        id: 'edge1',
                        source: 'trigger',
                        target: 'node1',
                    },
                ],
            } as unknown as VisualBuilderGraph

            // Reorder nodes (swap node1 and node2)
            const result = reorderNodes(initialGraph, ['node2', 'node1'])

            // Verify the first edge connects trigger to node2
            expect(result.edges[0]).toEqual(
                expect.objectContaining({
                    source: 'trigger',
                    target: 'node2',
                })
            )

            // Verify node2 connects to node1 with success condition
            const node2ToNode1Edge = result.edges.find(
                (edge) => edge.source === 'node2' && edge.target === 'node1'
            )
            expect(node2ToNode1Edge).toBeTruthy()
            expect(node2ToNode1Edge?.data).toEqual(
                expect.objectContaining({
                    name: 'Success',
                    conditions: expect.objectContaining({
                        and: [
                            {
                                equals: [
                                    {var: 'steps_state.node2.success'},
                                    true,
                                ],
                            },
                        ],
                    }),
                })
            )

            // Verify node2 connects to failure2 with error condition
            const node2ToFailure2Edge = result.edges.find(
                (edge) => edge.source === 'node2' && edge.target === 'failure2'
            )
            expect(node2ToFailure2Edge).toBeTruthy()
            expect(node2ToFailure2Edge?.data).toEqual(
                expect.objectContaining({
                    name: 'Error',
                })
            )

            // Verify node1 connects to success with success condition
            const node1ToSuccessEdge = result.edges.find(
                (edge) => edge.source === 'node1' && edge.target === 'success'
            )
            expect(node1ToSuccessEdge).toBeTruthy()
            expect(node1ToSuccessEdge?.data).toEqual(
                expect.objectContaining({
                    name: 'Success',
                    conditions: expect.objectContaining({
                        and: [
                            {
                                equals: [
                                    {var: 'steps_state.node1.success'},
                                    true,
                                ],
                            },
                        ],
                    }),
                })
            )

            // Verify node1 connects to failure1 with error condition
            const node1ToFailure1Edge = result.edges.find(
                (edge) => edge.source === 'node1' && edge.target === 'failure1'
            )
            expect(node1ToFailure1Edge).toBeTruthy()
            expect(node1ToFailure1Edge?.data).toEqual(
                expect.objectContaining({
                    name: 'Error',
                })
            )
        })

        it('handles missing nodes gracefully', () => {
            const initialGraph = {
                nodes: [
                    {
                        id: 'trigger',
                        type: 'channel_trigger',
                        position: {x: 0, y: 0},
                        data: {},
                    },
                    {
                        id: 'node1',
                        type: 'reusable_llm_prompt_call',
                        position: {x: 0, y: 100},
                        data: {},
                    },
                    {
                        id: 'success',
                        type: 'end',
                        position: {x: 0, y: 300},
                        data: {action: 'end-success'},
                    },
                ],
                edges: [
                    {
                        id: 'edge1',
                        source: 'trigger',
                        target: 'node1',
                    },
                ],
            } as unknown as VisualBuilderGraph

            // Try to reorder with non-existent node
            const result = reorderNodes(initialGraph, ['node1', 'non-existent'])

            // Verify the edges are correctly set up
            expect(result.edges[0]).toEqual(
                expect.objectContaining({
                    source: 'trigger',
                    target: 'node1',
                })
            )

            const node1ToSuccessEdge = result.edges.find(
                (edge) => edge.source === 'node1' && edge.target === 'success'
            )
            expect(node1ToSuccessEdge).toBeTruthy()
            expect(node1ToSuccessEdge?.data).toEqual(
                expect.objectContaining({
                    name: 'Success',
                    conditions: expect.objectContaining({
                        and: [
                            {
                                equals: [
                                    {var: 'steps_state.node1.success'},
                                    true,
                                ],
                            },
                        ],
                    }),
                })
            )
        })

        it('handles missing trigger or end nodes gracefully', () => {
            const graphWithoutTrigger = {
                nodes: [
                    {
                        id: 'node1',
                        type: 'reusable_llm_prompt_call',
                        position: {x: 0, y: 100},
                        data: {},
                    },
                    {
                        id: 'success',
                        type: 'end',
                        position: {x: 0, y: 300},
                        data: {action: 'end-success'},
                    },
                ],
                edges: [
                    {
                        id: 'edge1',
                        source: 'node1',
                        target: 'success',
                    },
                ],
            } as unknown as VisualBuilderGraph

            // Should return original graph unchanged when trigger is missing
            const result = reorderNodes(graphWithoutTrigger, ['node1'])
            expect(result).toEqual(
                expect.objectContaining({
                    nodes: expect.arrayContaining([
                        expect.objectContaining({
                            id: 'node1',
                            type: 'reusable_llm_prompt_call',
                        }),
                        expect.objectContaining({
                            id: 'success',
                            type: 'end',
                            data: {action: 'end-success'},
                        }),
                    ]),
                    edges: expect.arrayContaining([
                        expect.objectContaining({
                            source: 'node1',
                            target: 'success',
                        }),
                    ]),
                })
            )

            const graphWithoutEnd = {
                nodes: [
                    {
                        id: 'trigger',
                        type: 'channel_trigger',
                        position: {x: 0, y: 0},
                        data: {},
                    },
                    {
                        id: 'node1',
                        type: 'reusable_llm_prompt_call',
                        position: {x: 0, y: 100},
                        data: {},
                    },
                ],
                edges: [
                    {
                        id: 'edge1',
                        source: 'trigger',
                        target: 'node1',
                    },
                ],
            } as unknown as VisualBuilderGraph

            // Should return original graph unchanged when end node is missing
            const result2 = reorderNodes(graphWithoutEnd, ['node1'])
            expect(result2).toEqual(
                expect.objectContaining({
                    nodes: expect.arrayContaining([
                        expect.objectContaining({
                            id: 'trigger',
                            type: 'channel_trigger',
                        }),
                        expect.objectContaining({
                            id: 'node1',
                            type: 'reusable_llm_prompt_call',
                        }),
                    ]),
                    edges: expect.arrayContaining([
                        expect.objectContaining({
                            source: 'trigger',
                            target: 'node1',
                        }),
                    ]),
                })
            )
        })
    })

    test('INSERT_REUSABLE_LLM_PROMPT_CALL_NODE handles product input mapping and trigger node updates', () => {
        const graph = {
            ...visualBuilderGraphLlmPromptTriggerFixture,
            nodes: [
                {
                    ...buildNodeCommonProperties(),
                    ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0],
                    type: 'llm_prompt_trigger',
                    data: {
                        ...visualBuilderGraphLlmPromptTriggerFixture.nodes[0]
                            .data,
                        inputs: [],
                    },
                } as LLMPromptTriggerNodeType,
                ...visualBuilderGraphLlmPromptTriggerFixture.nodes.slice(1),
            ],
        } as unknown as VisualBuilderGraph

        const nextG = reusableLLMPromptCallReducer(graph, {
            type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE',
            beforeNodeId: 'http_request1',
            configurationId: 'config123',
            configurationInternalId: 'internal123',
            trigger: {
                custom_inputs: [],
                object_inputs: [
                    {
                        kind: 'product',
                        name: 'Test Product',
                        instructions: 'Select test product',
                        id: 'test_product',
                    } as const,
                ],
                outputs: [],
            },
            entrypoint: {
                requires_confirmation: false,
            },
            app: {type: 'app' as const, app_id: 'app123'},
            values: {},
        })

        // Verify trigger node updates
        const triggerNode = nextG.nodes[0] as LLMPromptTriggerNodeType
        const productInput = triggerNode.data.inputs.find(
            (
                input
            ): input is {
                id: string
                name: string
                instructions: string
                kind: 'product'
            } => 'kind' in input && input.kind === 'product'
        )

        expect(productInput).toBeDefined()
        expect(productInput?.name).toBe('Test Product')
        expect(productInput?.instructions).toBe('Select test product')
        expect(productInput?.kind).toBe('product')

        // Verify reusable LLM prompt call node mapping
        const reusableLLMPromptCallNode = nextG.nodes.find(
            (n): n is ReusableLLMPromptCallNodeType =>
                n.type === 'reusable_llm_prompt_call'
        )
        expect(reusableLLMPromptCallNode?.data.objects).toEqual({
            products: {
                test_product: `{{objects.products.${productInput?.id}}}`,
            },
        })
    })
})
