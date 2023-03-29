import React, {
    useCallback,
    useEffect,
    useState,
    useContext,
    createContext,
    useReducer,
    useRef,
} from 'react'
import {produce} from 'immer'
import _isEqual from 'lodash/isEqual'
import {ulid} from 'ulidx'
import useWorkflowApi, {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStepChoices,
    wasThisHelpfulWorkflowId,
} from '../../hooks/useWorkflowApi'
import useOnLoaded from './useOnLoaded'

type WorkflowConfigurationContext = {
    hookError: Maybe<string>
    configuration: WorkflowConfiguration
    isDirty: boolean
    isFetchPending: boolean
    isSavePending: boolean
    handleValidate: () => Maybe<string>
    handleSave: () => Promise<void>
    handleDiscard: () => void
    dispatch: React.Dispatch<WorkflowConfigurationAction>
}

const WorkflowConfigurationContext = createContext<
    WorkflowConfigurationContext | undefined
>(undefined)

export function useWorkflowConfigurationContext() {
    const context = useContext(WorkflowConfigurationContext)
    if (!context)
        throw new Error(
            'A workflowConfigurationContext cannot be found in the scope'
        )
    return context
}

export const withWorkflowConfigurationContext =
    <
        WrappedProps extends JSX.IntrinsicAttributes & {
            currentAccountId: number
            workflowId: string
            isNewWorkflow: boolean
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowConfiguration(
            props.currentAccountId,
            props.workflowId,
            props.isNewWorkflow
        )
        return (
            <WorkflowConfigurationContext.Provider value={contextValue}>
                <Component {...props} />
            </WorkflowConfigurationContext.Provider>
        )
    }

export function useWorkflowConfiguration(
    currentAccountId: number,
    workflowId: string,
    isNew: boolean
): WorkflowConfigurationContext {
    const {
        fetchWorkflowConfiguration,
        createWorkflowConfiguration,
        updateWorkflowConfiguration,
        workflowConfigurationFactory,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(!isNew)
    const [isSavePending, setIsSavePending] = useState(false)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(currentAccountId, workflowId)
    )
    const [localConfiguration, dispatch] = useReducer(
        reducer,
        workflowFactoryInstance.current
    )
    const [hookError, setHookError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            if (!isNew) {
                setIsFetchPending(true)
                const fetched = await fetchWorkflowConfiguration(workflowId)
                if (!fetched) setHookError('workflow not found')
                setRemoteConfiguration(fetched)
                setIsFetchPending(false)
            }
        }
        void fetch()
    }, [workflowId, isNew, fetchWorkflowConfiguration])

    useOnLoaded(remoteConfiguration, () => {
        if (!remoteConfiguration) return
        dispatch({
            type: 'RESET_CONFIGURATION',
            configuration: remoteConfiguration,
        })
    })

    const isDirty =
        !_isEqual(localConfiguration, remoteConfiguration) &&
        localConfiguration !== workflowFactoryInstance.current

    const handleValidate = useCallback(
        () => validate(localConfiguration),
        [localConfiguration]
    )

    const handleSave = useCallback(async () => {
        if (validate(localConfiguration)) {
            return
        }
        if (!isDirty) return
        setIsSavePending(true)
        try {
            if (isNew) {
                await createWorkflowConfiguration(localConfiguration)
            } else {
                await updateWorkflowConfiguration(localConfiguration)
            }
        } catch (e) {
            setIsSavePending(false)
            throw e
        }
        setRemoteConfiguration(localConfiguration)
        setIsSavePending(false)
    }, [
        isDirty,
        isNew,
        createWorkflowConfiguration,
        updateWorkflowConfiguration,
        localConfiguration,
    ])

    const handleDiscard = useCallback(() => {
        dispatch({
            type: 'RESET_CONFIGURATION',
            configuration:
                remoteConfiguration ??
                workflowConfigurationFactory(currentAccountId, workflowId),
        })
    }, [
        remoteConfiguration,
        workflowConfigurationFactory,
        currentAccountId,
        workflowId,
    ])

    return {
        hookError,
        configuration: localConfiguration,
        isFetchPending,
        isSavePending,
        isDirty,
        handleValidate,
        handleSave,
        handleDiscard,
        dispatch,
    }
}

function validate(conf: WorkflowConfiguration): Maybe<string> {
    if (conf.name.trim().length === 0)
        return 'You must add a flow name in order to save'
    else if (conf.name.length > 100)
        return 'Flow name must be less than 100 characters'
    if (
        conf.steps.find(
            (s) =>
                s.kind === 'messages' &&
                s.settings.messages[0].content.text.trim().length === 0
        ) ||
        conf.steps.find(
            (s) =>
                s.kind === 'choices' &&
                s.settings.choices.find((c) => c.label.trim().length === 0)
        )
    )
        return 'Complete or delete incomplete steps in order to save'
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
        case 'ADD_REPLY_BUTTONS': {
            const wasThisHelpfulStepId = configuration.transitions.find(
                (t) => t.from_step_id === action.step_id
            )?.to_step_id
            let nextConfiguration = wasThisHelpfulStepId
                ? deleteConfigurationBranch(configuration, wasThisHelpfulStepId)
                : configuration
            nextConfiguration = produce(nextConfiguration, (draft) => {
                const choicesStepId = ulid()
                const choiceEventA = ulid()
                const choiceEventB = ulid()
                const automatedMessageA = ulid()
                const automatedMessageB = ulid()
                const wasThisHelpfulA = ulid()
                const wasThisHelpfulB = ulid()
                draft.steps.push(
                    {
                        id: choicesStepId,
                        kind: 'choices',
                        settings: {
                            choices: [
                                {
                                    event_id: choiceEventA,
                                    label: '',
                                },
                                {
                                    event_id: choiceEventB,
                                    label: '',
                                },
                            ],
                        },
                    },
                    {
                        id: automatedMessageA,
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
                    },
                    {
                        id: automatedMessageB,
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
                    },
                    {
                        id: wasThisHelpfulA,
                        kind: 'workflow_call',
                        settings: {
                            configuration_id: wasThisHelpfulWorkflowId,
                        },
                    },
                    {
                        id: wasThisHelpfulB,
                        kind: 'workflow_call',
                        settings: {
                            configuration_id: wasThisHelpfulWorkflowId,
                        },
                    }
                )
                draft.transitions.push(
                    {
                        id: ulid(),
                        from_step_id: action.step_id,
                        to_step_id: choicesStepId,
                    },
                    {
                        id: ulid(),
                        event: {
                            id: choiceEventA,
                            kind: 'choices',
                        },
                        from_step_id: choicesStepId,
                        to_step_id: automatedMessageA,
                    },
                    {
                        id: ulid(),
                        event: {
                            id: choiceEventB,
                            kind: 'choices',
                        },
                        from_step_id: choicesStepId,
                        to_step_id: automatedMessageB,
                    },
                    {
                        id: ulid(),
                        from_step_id: automatedMessageA,
                        to_step_id: wasThisHelpfulA,
                    },
                    {
                        id: ulid(),
                        from_step_id: automatedMessageB,
                        to_step_id: wasThisHelpfulB,
                    }
                )
            })
            return nextConfiguration
        }
        case 'ADD_REPLY_BUTTON': {
            const choicesStepId = configuration.transitions.find(
                (t) => t.from_step_id === action.step_id
            )?.to_step_id
            if (!choicesStepId) return configuration
            const choiceEventId = ulid()
            const automatedMessageId = ulid()
            const wasThisHelpfulId = ulid()
            return produce(configuration, (draft) => {
                const choicesStep = draft.steps.find<WorkflowStepChoices>(
                    (s): s is WorkflowStepChoices =>
                        s.kind === 'choices' && s.id === choicesStepId
                )!
                choicesStep.settings.choices.push({
                    event_id: choiceEventId,
                    label: '',
                })
                draft.steps.push(
                    {
                        id: automatedMessageId,
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
                    },
                    {
                        id: wasThisHelpfulId,
                        kind: 'workflow_call',
                        settings: {
                            configuration_id: wasThisHelpfulWorkflowId,
                        },
                    }
                )
                draft.transitions.push(
                    {
                        id: ulid(),
                        from_step_id: choicesStepId,
                        to_step_id: automatedMessageId,
                        event: {
                            id: choiceEventId,
                            kind: 'choices',
                        },
                    },
                    {
                        id: ulid(),
                        from_step_id: automatedMessageId,
                        to_step_id: wasThisHelpfulId,
                    }
                )
            })
        }
        case 'DELETE_CHOICE': {
            const currentStep = configuration.steps.find(
                (s): s is WorkflowStepChoices =>
                    s.kind === 'choices' && s.id === action.step_id
            )
            if (!currentStep) return configuration
            const childId = configuration.transitions.find(
                (t) =>
                    t.from_step_id === action.step_id &&
                    t.event?.id === action.choice_event_id
            )?.to_step_id
            // delete the child automated message
            let nextConfiguration = childId
                ? deleteConfigurationBranch(configuration, childId)
                : configuration
            // remove the choice from the step
            nextConfiguration = {
                ...nextConfiguration,
                steps: nextConfiguration.steps.map((s) =>
                    s.id === currentStep.id
                        ? {
                              ...currentStep,
                              settings: {
                                  ...currentStep.settings,
                                  choices: currentStep.settings.choices.filter(
                                      (c) =>
                                          c.event_id !== action.choice_event_id
                                  ),
                              },
                          }
                        : s
                ),
            }
            // if no choices left, delete the step and the transition to it
            if (
                nextConfiguration.steps.find(
                    (s): s is WorkflowStepChoices => s.id === action.step_id
                )?.settings.choices.length === 0
            ) {
                nextConfiguration = deleteConfigurationBranch(
                    nextConfiguration,
                    action.step_id
                )
            }
            return nextConfiguration
        }
    }
}

function deleteConfigurationBranch(
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
    return childrenStepsIds.reduce(deleteConfigurationBranch, nextConfiguration)
}
