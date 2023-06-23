import {transformVisualBuilderGraphIntoWfConfiguration} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStepChoices,
    WorkflowStepMessages,
    WorkflowStepWorkflowCall,
    WorkflowTransition,
} from '../models/workflowConfiguration.types'

const genStepMessages = (
    id: string,
    content: MessageContent
): WorkflowStepMessages => ({
    id,
    kind: 'messages',
    settings: {
        messages: [
            {
                content,
            },
        ],
    },
})

const genStepChoices = (
    id: string,
    choices: WorkflowStepChoices['settings']['choices']
): WorkflowStepChoices => ({
    id,
    kind: 'choices',
    settings: {
        choices,
    },
})

const genStepWorkflowCall = (id: string): WorkflowStepWorkflowCall => ({
    id,
    kind: 'workflow_call',
    settings: {
        configuration_id: 'workflow-to-call-id',
    },
})

const genTransition = (
    fromId: string,
    toId: string,
    eventId?: Maybe<string>
): WorkflowTransition => ({
    id: `${fromId}-${toId}-${eventId ?? ''}`,
    from_step_id: fromId,
    to_step_id: toId,
    ...(eventId ? {event: {id: eventId, kind: 'choices'}} : {}),
})

describe('workflowConfiguration is transformed into visualBuilderGraph', () => {
    test('full configuration', () => {
        const c: WorkflowConfiguration = {
            id: '1',
            internal_id: '1',
            is_draft: false,
            account_id: 1,
            name: 'test',
            initial_step_id: 'messages1',
            entrypoint: {
                label: 'entrypoint',
                label_tkey: 'entrypoint_tkey',
            },
            steps: [
                genStepMessages('messages1', {html: 'html', text: 'text'}),
                genStepChoices('choices1', [
                    {
                        label: 'choice1',
                        event_id: 'eventId1',
                    },
                    {
                        label: 'choice2',
                        event_id: 'eventId2',
                    },
                ]),
                genStepMessages('messages2', {html: 'html', text: 'text'}),
                genStepMessages('messages3', {html: 'html', text: 'text'}),
                genStepWorkflowCall('workflowCall1'),
                genStepWorkflowCall('workflowCall2'),
            ],
            transitions: [
                genTransition('messages1', 'choices1'),
                genTransition('choices1', 'messages2', 'eventId1'),
                genTransition('choices1', 'messages3', 'eventId2'),
                genTransition('messages2', 'workflowCall1'),
                genTransition('messages3', 'workflowCall2'),
            ],
        }
        const visualBuilderGraph =
            transformWorkflowConfigurationIntoVisualBuilderGraph(
                transformVisualBuilderGraphIntoWfConfiguration(
                    transformWorkflowConfigurationIntoVisualBuilderGraph(c)
                )
            )
        expect(visualBuilderGraph.nodes.length).toBe(6)
        expect(visualBuilderGraph.nodes).toEqual(
            // arrayContaining does not check the order
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'trigger_button',
                    data: expect.objectContaining({
                        label: 'entrypoint',
                        label_tkey: 'entrypoint_tkey',
                    }),
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'multiple_choices',
                    data: {
                        content: {
                            html: 'html',
                            text: 'text',
                        },
                        choices: [
                            {
                                label: 'choice1',
                                event_id: 'eventId1',
                            },
                            {
                                label: 'choice2',
                                event_id: 'eventId2',
                            },
                        ],
                        wfConfigurationRef: {
                            wfConfigurationMessagesStepId: 'messages1',
                            wfConfigurationChoicesStepId: 'choices1',
                        },
                    },
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'automated_answer',
                    data: {
                        content: {
                            html: 'html',
                            text: 'text',
                        },
                        wfConfigurationRef: {
                            wfConfigurationMessagesStepId: 'messages2',
                        },
                    },
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'end',
                    data: {
                        wfConfigurationRef: {
                            wfConfigurationWorkflowCallStepId: 'workflowCall1',
                        },
                    },
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'automated_answer',
                    data: {
                        content: {
                            html: 'html',
                            text: 'text',
                        },
                        wfConfigurationRef: {
                            wfConfigurationMessagesStepId: 'messages3',
                        },
                    },
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    type: 'end',
                    data: {
                        wfConfigurationRef: {
                            wfConfigurationWorkflowCallStepId: 'workflowCall2',
                        },
                    },
                }),
            ])
        )
        const [
            {id: triggerButtonNodeId},
            {id: multipleChoicesId},
            {id: automatedReply1NodeId},
            {id: end1NodeId},
            {id: automatedReply2NodeId},
            {id: end2NodeId},
        ] = visualBuilderGraph.nodes
        expect(visualBuilderGraph.edges.length).toBe(5)
        expect(visualBuilderGraph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    source: triggerButtonNodeId,
                    target: multipleChoicesId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedReply1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedReply1NodeId,
                    target: end1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedReply2NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedReply2NodeId,
                    target: end2NodeId,
                }),
            ])
        )
    })
})
