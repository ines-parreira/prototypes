import {useReducer} from 'react'
import {produce} from 'immer'
import {ulid} from 'ulidx'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStepChoices,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export function useWorkflowConfigurationReducer(
    initialState: WorkflowConfiguration
) {
    return useReducer(reducer, initialState)
}

export type WorkflowConfigurationAction =
    | {
          type: 'RESET_CONFIGURATION'
          configuration: WorkflowConfiguration
      }
    | {
          type: 'SET_NAME'
          name: string
      }
    | {
          type: 'SET_AUTOMATED_MESSAGE_CONTENT'
          step_id: string
          content: MessageContent
      }
    | {
          type: 'SET_REPLY_BUTTON_LABEL'
          step_id: string
          event_id: string
          label: string
      }
    | {type: 'SET_ENTRYPOINT_LABEL'; label: string}
    | {type: 'ADD_REPLY_BUTTONS'; step_id: string}
    | {type: 'ADD_REPLY_BUTTON'; step_id: string}
    | {type: 'DELETE_CHOICE'; step_id: string; choice_event_id: string}

export function reducer(
    configuration: WorkflowConfiguration,
    action: WorkflowConfigurationAction
) {
    switch (action.type) {
        case 'RESET_CONFIGURATION':
            return action.configuration
        case 'SET_NAME':
            return {...configuration, name: action.name}
        case 'SET_AUTOMATED_MESSAGE_CONTENT':
            return produce(configuration, (draft) => {
                const step = draft.steps.find((s) => s.id === action.step_id)
                if (step && step.kind === 'messages')
                    step.settings.messages[0].content = action.content
            })
        case 'SET_REPLY_BUTTON_LABEL':
            return produce(configuration, (draft) => {
                const step = draft.steps.find((s) => s.id === action.step_id)
                if (!step || step.kind !== 'choices') return draft
                const choice = step.settings.choices.find(
                    (c) => c.event_id === action.event_id
                )
                if (!choice) return draft
                choice.label = action.label
            })
        case 'SET_ENTRYPOINT_LABEL':
            return produce(configuration, (draft) => {
                if (!draft.entrypoint) {
                    draft.entrypoint = {
                        label_tkey: ulid(),
                        label: action.label,
                    }
                } else {
                    draft.entrypoint.label = action.label
                }
            })
        case 'ADD_REPLY_BUTTONS':
            return addReplyButton(
                addReplyButton(configuration, action.step_id),
                action.step_id
            )
        case 'ADD_REPLY_BUTTON':
            return addReplyButton(configuration, action.step_id)
        case 'DELETE_CHOICE':
            return deleteChoice(
                configuration,
                action.step_id,
                action.choice_event_id
            )
    }
}

function addChoiceStepChildIfNotExists(
    configuration: WorkflowConfiguration,
    automatedMessageStepId: string
): WorkflowConfiguration {
    const messageChildStep = getChildStep(configuration, automatedMessageStepId)
    const isMessageALeaf =
        !messageChildStep || messageChildStep?.kind === 'workflow_call'
    let nextConfiguration = configuration
    let choicesStep: WorkflowStepChoices
    // create a choices step if he's not already there, while removing the workflow_call step
    if (isMessageALeaf) {
        nextConfiguration = messageChildStep
            ? deleteStepAndChildren(configuration, messageChildStep.id)
            : configuration
        nextConfiguration = produce(nextConfiguration, (draft) => {
            choicesStep = {
                id: ulid(),
                kind: 'choices',
                settings: {choices: []},
            }
            draft.steps.push(choicesStep)
            draft.transitions.push({
                id: ulid(),
                from_step_id: automatedMessageStepId,
                to_step_id: choicesStep.id,
            })
        })
    }
    return nextConfiguration
}

function appendWasItHelpfulWorkflowCall(
    configuration: WorkflowConfiguration,
    leafStepId: string
) {
    return produce(configuration, (draft) => {
        const wasThisHelpfulStepId = ulid()
        draft.steps.push({
            id: wasThisHelpfulStepId,
            kind: 'workflow_call',
            settings: {
                configuration_id: WAS_THIS_HELPFUL_WORKFLOW_ID,
            },
        })
        draft.transitions.push({
            id: ulid(),
            from_step_id: leafStepId,
            to_step_id: wasThisHelpfulStepId,
        })
    })
}

function addReplyButton(
    configuration: WorkflowConfiguration,
    automatedMessageStepId: string
) {
    let nextConfiguration = addChoiceStepChildIfNotExists(
        configuration,
        automatedMessageStepId
    )
    const nextMessageStepId = ulid()
    nextConfiguration = produce(nextConfiguration, (draft) => {
        const choicesStep = getChildStep(draft, automatedMessageStepId)
        const choiceEventId = ulid()
        if (isStepChoices(choicesStep)) {
            choicesStep.settings.choices.push({
                event_id: choiceEventId,
                label: '',
            })
            draft.steps.push({
                id: nextMessageStepId,
                kind: 'messages',
                settings: {
                    messages: [
                        {
                            content: {
                                html: '',
                                text: '',
                            },
                        },
                    ],
                },
            })
            draft.transitions.push({
                id: ulid(),
                from_step_id: choicesStep.id,
                to_step_id: nextMessageStepId,
                event: {
                    id: choiceEventId,
                    kind: 'choices',
                },
            })
        } else {
            throw new Error('Expected a choices step')
        }
    })
    return appendWasItHelpfulWorkflowCall(nextConfiguration, nextMessageStepId)
}

function deleteChoice(
    configuration: WorkflowConfiguration,
    stepChoicesId: string,
    choiceEventId: string
): WorkflowConfiguration {
    let nextConfiguration = produce(configuration, (draft) => {
        const stepChoices = draft.steps.find(
            (s) => s.id === stepChoicesId
        ) as WorkflowStepChoices
        stepChoices.settings.choices = stepChoices.settings.choices.filter(
            (c) => c.event_id !== choiceEventId
        )
    })
    const stepMessagesToDeleteId = nextConfiguration.transitions.find(
        (t) => t.event?.id === choiceEventId
    )?.to_step_id
    if (stepMessagesToDeleteId) {
        nextConfiguration = deleteStepAndChildren(
            nextConfiguration,
            stepMessagesToDeleteId
        )
    }
    const stepChoicesLength =
        nextConfiguration.steps
            .filter((s) => s.id === stepChoicesId)
            .find(isStepChoices)?.settings.choices.length ?? -1
    if (stepChoicesLength === 0) {
        const messageParentId = getParentStep(
            nextConfiguration,
            stepChoicesId
        )?.id
        if (!messageParentId) throw new Error('Expected a parent step')
        return appendWasItHelpfulWorkflowCall(
            deleteStepAndChildren(nextConfiguration, stepChoicesId),
            messageParentId
        )
    }
    return nextConfiguration
}

// utils

function deleteStepAndChildren(
    configuration: WorkflowConfiguration,
    currentStepId: string
): WorkflowConfiguration {
    const nextConfiguration: WorkflowConfiguration = {
        ...configuration,
        steps: configuration.steps.filter((s) => s.id !== currentStepId),
        transitions: configuration.transitions.filter(
            (t) =>
                t.from_step_id !== currentStepId &&
                t.to_step_id !== currentStepId
        ),
    }
    const childrenStepsIds = configuration.transitions
        .filter((t) => t.from_step_id === currentStepId)
        .map((t) => t.to_step_id)
    return childrenStepsIds.reduce(deleteStepAndChildren, nextConfiguration)
}

function getChildStep(
    configuration: WorkflowConfiguration,
    currentStepId: string
): Maybe<WorkflowConfiguration['steps'][number]> {
    const transition = configuration.transitions.find(
        (t) => t.from_step_id === currentStepId
    )
    return configuration.steps.find((s) => s.id === transition?.to_step_id)
}

function getParentStep(
    configuration: WorkflowConfiguration,
    currentStepId: string
): Maybe<WorkflowConfiguration['steps'][number]> {
    const transition = configuration.transitions.find(
        (t) => t.to_step_id === currentStepId
    )
    return configuration.steps.find((s) => s.id === transition?.from_step_id)
}

function isStepChoices(
    step: Maybe<WorkflowConfiguration['steps'][number]>
): step is WorkflowStepChoices {
    return step?.kind === 'choices'
}
