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
} from './useWorkflowApi'
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
            workflowId: string
            isNewWorkflow: boolean
        }
    >(
        Component: React.FC<WrappedProps>
    ) =>
    (props: WrappedProps) => {
        const contextValue = useWorkflowConfiguration(
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
    workflowId: string,
    isNew: boolean
): WorkflowConfigurationContext {
    const {
        fetchWorkflowConfiguration,
        upsertWorkflowConfiguration,
        workflowConfigurationFactory,
    } = useWorkflowApi()
    const [isFetchPending, setIsFetchPending] = useState(!isNew)
    const [isSavePending, setIsSavePending] = useState(false)
    const [remoteConfiguration, setRemoteConfiguration] =
        useState<Maybe<WorkflowConfiguration>>(null)
    const workflowFactoryInstance = useRef(
        workflowConfigurationFactory(workflowId)
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
        await upsertWorkflowConfiguration(localConfiguration)
        setRemoteConfiguration(localConfiguration)
        setIsSavePending(false)
    }, [isDirty, upsertWorkflowConfiguration, localConfiguration])

    const handleDiscard = useCallback(() => {
        dispatch({
            type: 'RESET_CONFIGURATION',
            configuration:
                remoteConfiguration ?? workflowConfigurationFactory(workflowId),
        })
    }, [remoteConfiguration, workflowConfigurationFactory, workflowId])

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
            const nextConfiguration = produce(configuration, (draft) => {
                const choicesStepId = ulid()
                const choiceEventA = ulid()
                const choiceEventB = ulid()
                const automatedMessageA = ulid()
                const automatedMessageB = ulid()
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
                            author: {
                                kind: 'bot',
                            },
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
                            author: {
                                kind: 'bot',
                            },
                        },
                    }
                )
                draft.transitions.push(
                    {
                        from_step_id: action.step_id,
                        to_step_id: choicesStepId,
                    },
                    {
                        event: {
                            id: choiceEventA,
                            kind: 'choices',
                        },
                        from_step_id: choicesStepId,
                        to_step_id: automatedMessageA,
                    },
                    {
                        event: {
                            id: choiceEventB,
                            kind: 'choices',
                        },
                        from_step_id: choicesStepId,
                        to_step_id: automatedMessageB,
                    }
                )
            })
            return nextConfiguration
        }
    }
}
