import {transformVisualBuilderGraphIntoWfConfiguration} from '../models/visualBuilderGraph.model'
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
        expect(transformed.steps.length).toBe(11)
        expect(transformed.steps).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 'messages1',
                    kind: 'messages',
                }),
                expect.objectContaining({
                    id: 'choices1',
                    kind: 'choices',
                }),
                expect.objectContaining({
                    id: 'messages2',
                    kind: 'messages',
                }),
                expect.objectContaining({
                    id: 'workflowCall1',
                    kind: 'workflow_call',
                }),
                expect.objectContaining({
                    id: 'messages3',
                    kind: 'messages',
                }),
                expect.objectContaining({
                    id: 'workflowCall2',
                    kind: 'workflow_call',
                }),
                expect.objectContaining({
                    id: 'messages4',
                    kind: 'messages',
                }),
                expect.objectContaining({
                    id: 'textInput1',
                    kind: 'text-input',
                }),
                expect.objectContaining({
                    id: 'messages5',
                    kind: 'messages',
                }),
                expect.objectContaining({
                    id: 'attachmentsInput1',
                    kind: 'attachments-input',
                }),
                expect.objectContaining({
                    id: 'workflowCall3',
                    kind: 'workflow_call',
                }),
            ])
        )

        expect(transformed.transitions.length).toBe(10)
        expect(transformed.transitions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    from_step_id: 'messages1',
                    to_step_id: 'choices1',
                }),
                expect.objectContaining({
                    from_step_id: 'choices1',
                    to_step_id: 'messages2',
                }),
                expect.objectContaining({
                    from_step_id: 'messages2',
                    to_step_id: 'workflowCall1',
                }),
                expect.objectContaining({
                    from_step_id: 'choices1',
                    to_step_id: 'messages3',
                }),
                expect.objectContaining({
                    from_step_id: 'messages3',
                    to_step_id: 'workflowCall2',
                }),
                expect.objectContaining({
                    from_step_id: 'choices1',
                    to_step_id: 'messages4',
                }),
                expect.objectContaining({
                    from_step_id: 'messages4',
                    to_step_id: 'textInput1',
                }),
                expect.objectContaining({
                    from_step_id: 'textInput1',
                    to_step_id: 'messages5',
                }),
                expect.objectContaining({
                    from_step_id: 'messages5',
                    to_step_id: 'attachmentsInput1',
                }),
                expect.objectContaining({
                    from_step_id: 'attachmentsInput1',
                    to_step_id: 'workflowCall3',
                }),
            ])
        )
    })
})
