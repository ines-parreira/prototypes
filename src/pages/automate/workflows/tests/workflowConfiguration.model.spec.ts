import {transformVisualBuilderGraphIntoWfConfiguration} from '../models/visualBuilderGraph.model'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from '../models/workflowConfiguration.model'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStepChoices,
    WorkflowStepHelpfulPrompt,
    WorkflowStepMessage,
    WorkflowTransition,
} from '../models/workflowConfiguration.types'

const genStepMessage = (
    id: string,
    content: MessageContent
): WorkflowStepMessage => ({
    id,
    kind: 'message',
    settings: {
        message: {
            content: {
                html: content.html,
                text: content.text,
                html_tkey: content.html,
                text_tkey: content.text,
            },
        },
    },
})

const genStepChoices = (
    id: string,
    choices: WorkflowStepChoices['settings']['choices'],
    content: MessageContent
): WorkflowStepChoices => ({
    id,
    kind: 'choices',
    settings: {
        choices: choices.map((choice) => ({
            ...choice,
            label_tkey: choice.label,
        })),
        message: {
            content: {
                html: content.html,
                text: content.text,
                html_tkey: content.html,
                text_tkey: content.text,
            },
        },
    },
})

const genStepHelpfulPrompt = (id: string): WorkflowStepHelpfulPrompt => ({
    id,
    kind: 'helpful-prompt',
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
            name: 'test',
            initial_step_id: 'choices1',
            entrypoint: {
                label: 'entrypoint',
                label_tkey: 'entrypoint_tkey',
            },
            steps: [
                genStepChoices(
                    'choices1',
                    [
                        {
                            label: 'choice1',
                            event_id: 'eventId1',
                        },
                        {
                            label: 'choice2',
                            event_id: 'eventId2',
                        },
                    ],
                    {html: 'html', text: 'text'}
                ),
                genStepMessage('messages2', {html: 'html', text: 'text'}),
                genStepMessage('messages3', {html: 'html', text: 'text'}),
                genStepHelpfulPrompt('helpfulPrompt1'),
                genStepHelpfulPrompt('helpfulPrompt2'),
            ],
            transitions: [
                genTransition('choices1', 'messages2', 'eventId1'),
                genTransition('choices1', 'messages3', 'eventId2'),
                genTransition('messages2', 'helpfulPrompt1'),
                genTransition('messages3', 'helpfulPrompt2'),
            ],
            available_languages: ['en-US'],
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
                    type: 'channel_trigger',
                    data: expect.objectContaining({
                        label: 'entrypoint',
                        label_tkey: 'entrypoint_tkey',
                    }),
                }),
                expect.objectContaining({
                    id: 'choices1',
                    type: 'multiple_choices',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                        choices: expect.arrayContaining([
                            expect.objectContaining({
                                label: 'choice1',
                                event_id: 'eventId1',
                            }),
                            expect.objectContaining({
                                label: 'choice2',
                                event_id: 'eventId2',
                            }),
                        ]),
                    }),
                }),
                expect.objectContaining({
                    id: 'messages2',
                    type: 'automated_message',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: 'helpfulPrompt1',
                    type: 'end',
                    data: expect.objectContaining({
                        action: 'ask-for-feedback',
                    }),
                }),
                expect.objectContaining({
                    id: 'messages3',
                    type: 'automated_message',
                    data: expect.objectContaining({
                        content: expect.objectContaining({
                            html: 'html',
                            text: 'text',
                        }),
                    }),
                }),
                expect.objectContaining({
                    id: 'helpfulPrompt2',
                    type: 'end',
                    data: {
                        action: 'ask-for-feedback',
                    },
                }),
            ])
        )
        const [
            {id: channelTriggerNodeId},
            {id: multipleChoicesId},
            {id: automatedMessage1NodeId},
            {id: end1NodeId},
            {id: automatedMessage2NodeId},
            {id: end2NodeId},
        ] = visualBuilderGraph.nodes
        expect(visualBuilderGraph.edges.length).toBe(5)
        expect(visualBuilderGraph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    source: channelTriggerNodeId,
                    target: multipleChoicesId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedMessage1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedMessage1NodeId,
                    target: end1NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: multipleChoicesId,
                    target: automatedMessage2NodeId,
                }),
                expect.objectContaining({
                    id: expect.any(String),
                    source: automatedMessage2NodeId,
                    target: end2NodeId,
                }),
            ])
        )
    })
})
