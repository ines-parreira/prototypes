import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
    replaceAliases,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {VisualBuilderGraph} from '../models/visualBuilderGraph.types'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

describe('visualBuilderGraph is transformed into workflowConfiguration', () => {
    test('full graph', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const transformed = transformVisualBuilderGraphIntoWfConfiguration(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(g)
            )
        )
        const {id, account_id, is_draft, name, internal_id, initial_step_id} =
            transformed
        expect(transformed).toEqual(
            expect.objectContaining({
                id,
                account_id,
                is_draft,
                name,
                internal_id,
                initial_step_id,
            })
        )
        expect(transformed.steps.length).toBe(8)
        expect(transformed.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'multiple_choices1',
                    kind: 'choices',
                }),
                expect.objectContaining({
                    id: 'automated_message1',
                    kind: 'message',
                }),
                expect.objectContaining({
                    id: 'end1',
                    kind: 'helpful-prompt',
                }),
                expect.objectContaining({
                    id: 'automated_message2',
                    kind: 'message',
                }),
                expect.objectContaining({
                    id: 'end2',
                    kind: 'helpful-prompt',
                }),
                expect.objectContaining({
                    id: 'text_reply1',
                    kind: 'text-input',
                }),
                expect.objectContaining({
                    id: 'file_upload1',
                    kind: 'attachments-input',
                }),
                expect.objectContaining({
                    id: 'end3',
                    kind: 'helpful-prompt',
                }),
            ])
        )

        expect(transformed.transitions.length).toBe(7)
        expect(transformed.transitions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'automated_message1',
                }),
                expect.objectContaining({
                    from_step_id: 'automated_message1',
                    to_step_id: 'end1',
                }),
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'automated_message2',
                }),
                expect.objectContaining({
                    from_step_id: 'automated_message2',
                    to_step_id: 'end2',
                }),
                expect.objectContaining({
                    from_step_id: 'multiple_choices1',
                    to_step_id: 'text_reply1',
                }),
                expect.objectContaining({
                    from_step_id: 'text_reply1',
                    to_step_id: 'file_upload1',
                }),
                expect.objectContaining({
                    from_step_id: 'file_upload1',
                    to_step_id: 'end3',
                }),
            ])
        )
    })
})

describe('replace aliases', () => {
    test('order alias', () => {
        const g: VisualBuilderGraph = {
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
                    id: 'order_selection1',
                    type: 'order_selection',
                    data: {
                        content: {
                            html: 'html',
                            text: 'text',
                        },
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    id: 'automated_message1',
                    type: 'automated_message',
                    data: {
                        content: {
                            html: 'total amount {{order.total_amount | format_currency: order.currency.code, order.currency.decimals}}',
                            text: 'total amount {{order.total_amount | format_currency: order.currency.code, order.currency.decimals}}',
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
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'trigger_button1_order_selection1',
                    source: 'trigger_button1',
                    target: 'order_selection1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'order_selection1_automated_message1',
                    source: 'order_selection1',
                    target: 'automated_message1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'automated_message1_end1',
                    source: 'automated_message1',
                    target: 'end1',
                },
            ],
            available_languages: ['en-US'],
            wfConfigurationOriginal: {
                id: '1',
                account_id: 1,
                is_draft: false,
                name: 'my workflow',
                internal_id: '1',
                initial_step_id: 'order_selection1',
                steps: [
                    {
                        id: 'order_selection1',
                        kind: 'order-selection',
                        settings: {
                            message: {
                                content: {
                                    html: 'html',
                                    text: 'text',
                                },
                            },
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            },
        }

        replaceAliases(g)

        expect(g.nodes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'automated_message1',
                    type: 'automated_message',
                    data: {
                        content: {
                            html: 'total amount {{steps_state.order_selection1.order.total_amount | format_currency: steps_state.order_selection1.order.currency.code, steps_state.order_selection1.order.currency.decimals}}',
                            text: 'total amount {{steps_state.order_selection1.order.total_amount | format_currency: steps_state.order_selection1.order.currency.code, steps_state.order_selection1.order.currency.decimals}}',
                        },
                    },
                }),
            ])
        )
    })

    test('customer alias', () => {
        const g: VisualBuilderGraph = {
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
                    id: 'shopper_authentication1',
                    type: 'shopper_authentication',
                    data: {
                        integrationId: 1,
                    },
                },
                {
                    ...buildNodeCommonProperties(),
                    id: 'automated_message1',
                    type: 'automated_message',
                    data: {
                        content: {
                            html: 'email {{customer.email}}',
                            text: 'email {{customer.email}}',
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
            ],
            edges: [
                {
                    ...buildEdgeCommonProperties(),
                    id: 'trigger_button1_shopper_authentication1',
                    source: 'trigger_button1',
                    target: 'shopper_authentication1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'shopper_authentication1_automated_message1',
                    source: 'shopper_authentication1',
                    target: 'automated_message1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'automated_message1_end1',
                    source: 'automated_message1',
                    target: 'end1',
                },
            ],
            available_languages: ['en-US'],
            wfConfigurationOriginal: {
                id: '1',
                account_id: 1,
                is_draft: false,
                name: 'my workflow',
                internal_id: '1',
                initial_step_id: 'shopper_authentication1',
                steps: [
                    {
                        id: 'shopper_authentication1',
                        kind: 'shopper-authentication',
                        settings: {
                            integration_id: 1,
                        },
                    },
                ],
                transitions: [],
                available_languages: ['en-US'],
            },
        }

        replaceAliases(g)

        expect(g.nodes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'automated_message1',
                    type: 'automated_message',
                    data: {
                        content: {
                            html: 'email {{steps_state.shopper_authentication1.customer.email}}',
                            text: 'email {{steps_state.shopper_authentication1.customer.email}}',
                        },
                    },
                }),
            ])
        )
    })
})
