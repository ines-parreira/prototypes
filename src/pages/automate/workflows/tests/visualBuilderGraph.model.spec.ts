import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
    transformVisualBuilderGraphIntoWfConfiguration,
} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

describe('visualBuilderGraph is transformed into workflowConfiguration', () => {
    test('full graph', () => {
        const g = visualBuilderGraphSimpleChoicesFixture
        const transformed = transformVisualBuilderGraphIntoWfConfiguration(
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(g)
            )
        )
        const {id, is_draft, name, internal_id, initial_step_id} = transformed
        expect(transformed).toEqual(
            expect.objectContaining({
                id,
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

    it('should transform http request step JSON variable', () => {
        const configuration = transformVisualBuilderGraphIntoWfConfiguration({
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
                    id: 'trigger_button1_multiple_choices1',
                    source: 'trigger_button1',
                    target: 'http_request1',
                },
                {
                    ...buildEdgeCommonProperties(),
                    id: 'http_request1_end1',
                    source: 'http_request1',
                    target: 'end1',
                },
            ],
            available_languages: [],
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
                        settings: {
                            message: {content: {html: '', text: ''}},
                        },
                    },
                ],
                transitions: [],
                available_languages: [],
            },
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
        })

        expect(configuration.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'http_request1',
                    kind: 'http-request',
                    settings: expect.objectContaining({
                        variables: [
                            {
                                id: 'variable1',
                                name: '',
                                jsonpath: '$',
                                data_type: null,
                            },
                            {
                                id: 'variable2',
                                name: '',
                                jsonpath: '$.string',
                                data_type: 'string',
                            },
                        ],
                    }),
                }),
                expect.objectContaining({
                    id: 'end1',
                    kind: 'end',
                }),
            ])
        )
    })
})
