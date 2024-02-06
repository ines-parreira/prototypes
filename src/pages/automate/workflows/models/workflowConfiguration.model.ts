import {ulid} from 'ulidx'
import _omit from 'lodash/omit'
import {
    ORDER_SELECTION_WORKFLOW_ID,
    WAS_THIS_HELPFUL_WORKFLOW_ID,
} from '../constants'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from './visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    EndNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    MultipleChoicesNodeType,
    OrderSelectionNodeType,
    ShopperAuthenticationNodeType,
    TextReplyNodeType,
    TriggerButtonNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStep,
    WorkflowStepAttachmentsInput,
    WorkflowStepChoices,
    WorkflowStepHandover,
    WorkflowStepMessage,
    WorkflowStepHttpRequest,
    WorkflowStepTextInput,
    WorkflowTransition,
    WorkflowStepHelpfulPrompt,
    WorkflowStepOrderSelection,
    WorkflowStepShopperAuthentication,
} from './workflowConfiguration.types'

export function walkWorkflowConfigurationGraph(
    c: WorkflowConfiguration,
    currentStepId: string,
    f: (
        step: WorkflowStep,
        context: {
            previousStep: WorkflowStep | undefined
            nextSteps: WorkflowStep[]
            incomingTransition: WorkflowTransition | undefined
            outgoingTransitions: WorkflowTransition[]
        }
    ) => void
) {
    const step = c.steps.find((s) => s.id === currentStepId)
    if (!step) return
    const incomingTransition = c.transitions.find(
        (t) => t.to_step_id === currentStepId
    )
    const previousStep = incomingTransition
        ? c.steps.find((s) => s.id === incomingTransition.from_step_id)
        : undefined
    const outgoingTransitions = c.transitions.filter(
        (t) => t.from_step_id === currentStepId
    )
    const nextSteps = outgoingTransitions.reduce(
        (acc, t) => [...acc, ...c.steps.filter((s) => s.id === t.to_step_id)],
        [] as WorkflowStep[]
    )
    f(step, {previousStep, incomingTransition, outgoingTransitions, nextSteps})
    if (outgoingTransitions.length === 0) return
    for (const outgoingTransition of outgoingTransitions) {
        walkWorkflowConfigurationGraph(c, outgoingTransition.to_step_id, f)
    }
}

function injectTkeysInContentIfNotExist(content: MessageContent) {
    const {html_tkey, text_tkey, ...rest} = content
    return {
        html_tkey: html_tkey || ulid(),
        text_tkey: text_tkey || ulid(),
        ...rest,
    }
}

function injectTkeysInChoicesIfNotExist(
    choices: MultipleChoicesNodeType['data']['choices']
) {
    return choices.map((c) => {
        const {label_tkey, ...rest} = c
        return {
            label_tkey: label_tkey || ulid(),
            ...rest,
        }
    })
}

export function transformWorkflowConfigurationIntoVisualBuilderGraph(
    c: WorkflowConfiguration
): VisualBuilderGraph {
    const triggerButtonNode: TriggerButtonNodeType = {
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'trigger_button',
        data: {
            label: c.entrypoint?.label ?? '',
            label_tkey: c.entrypoint?.label_tkey ?? ulid(),
        },
    }
    const nodes: VisualBuilderNode[] = [triggerButtonNode]
    const edges: VisualBuilderEdge[] = []
    const nodeIdByStepId: Record<string, string> = {}

    let isNewModel = false

    walkWorkflowConfigurationGraph(c, c.initial_step_id, (step, context) => {
        const {previousStep, nextSteps, incomingTransition} = context

        // 1:1 step <> node mapping (almost)
        if (step.kind === 'message') {
            isNewModel = true
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'automated_message',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessageStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'choices' && step.settings.message) {
            isNewModel = true
            const n: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'multiple_choices',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                    choices: injectTkeysInChoicesIfNotExist(
                        step.settings.choices
                    ),
                    wfConfigurationRef: {
                        wfConfigurationChoicesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'text-input' && step.settings) {
            isNewModel = true
            const n: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'text_reply',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationTextInputStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'attachments-input' && step.settings) {
            isNewModel = true
            const n: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'file_upload',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationAttachmentsInputStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'order-selection' && step.settings) {
            isNewModel = true
            const n: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_selection',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationOrderSelectionStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'helpful-prompt') {
            isNewModel = true
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationHelpfulPromptOrHandoverStepId: step.id,
                    },
                    withWasThisHelpfulPrompt: true,
                    ticketTags: step.settings?.ticket_tags,
                    ticketAssigneeUserId:
                        step.settings?.ticket_assignee_user_id,
                    ticketAssigneeTeamId:
                        step.settings?.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'choices'
        ) {
            // group message step followed by a choice step into a multiple_choices node
            const n: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'multiple_choices',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    choices: injectTkeysInChoicesIfNotExist(
                        nextSteps[0].settings.choices
                    ),
                    wfConfigurationRef: {
                        wfConfigurationChoicesStepId: nextSteps[0].id,
                        wfConfigurationMessagesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'text-input'
        ) {
            // group message step followed by a text-input step into a text_reply node
            const n: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'text_reply',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationTextInputStepId: nextSteps[0].id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (
            step.kind === 'messages' &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'attachments-input'
        ) {
            // group message step followed by an attachments-input step into a file_upload node
            const n: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'file_upload',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationAttachmentsInputStepId: nextSteps[0].id,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (
            step.kind === 'messages' &&
            previousStep &&
            nextSteps.length === 1 &&
            nextSteps[0].kind === 'workflow_call' &&
            nextSteps[0].settings.configuration_id ===
                ORDER_SELECTION_WORKFLOW_ID
        ) {
            const noOrdersWorkflowCallStepId = c.transitions.find(
                (t) =>
                    t.from_step_id === previousStep.id &&
                    t.to_step_id !== step.id
            )?.to_step_id

            if (!noOrdersWorkflowCallStepId) {
                throw new Error(
                    `order_selection node expects a "branching" step:
                    - workflow_call (no orders)
                    - message -> workflow_call (order selection)`
                )
            }

            // group branching step (1) workflow-call, (2) message -> workflow_call steps into an order_selection node
            const n: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_selection',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                        wfConfigurationOrderSelectionWorkflowCallStepId:
                            nextSteps[0].id,
                        wfConfigurationNoOrdersWorkflowCallStepId:
                            noOrdersWorkflowCallStepId,
                    },
                },
            }
            nodeIdByStepId[nextSteps[0].id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (step.kind === 'messages') {
            // single message step will become an automated_answer node
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'automated_message',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.messages[0].content
                    ),
                    wfConfigurationRef: {
                        wfConfigurationMessagesStepId: step.id,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } /* DEPRECATED */ else if (
            step.kind === 'workflow_call' &&
            step.settings.configuration_id === WAS_THIS_HELPFUL_WORKFLOW_ID
        ) {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationWorkflowCallOrHandoverStepId: step.id,
                    },
                    withWasThisHelpfulPrompt: true,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'handover') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationHelpfulPromptOrHandoverStepId: step.id,
                    },
                    withWasThisHelpfulPrompt: false,
                    ticketTags: step.settings.ticket_tags,
                    ticketAssigneeUserId: step.settings.ticket_assignee_user_id,
                    ticketAssigneeTeamId: step.settings.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'http-request') {
            const bodyContentType = step.settings.headers?.[
                'content-type'
            ] as HttpRequestNodeType['data']['bodyContentType']

            const n: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'http_request',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationHttpRequestStepId: step.id,
                    },
                    name: step.settings.name,
                    url: step.settings.url,
                    method: step.settings.method,
                    headers: Object.entries(
                        _omit(step.settings.headers ?? {}, 'content-type')
                    ).map(([name, value]) => ({name, value})),
                    json:
                        bodyContentType === 'application/json'
                            ? step.settings.body
                            : undefined,
                    formUrlencoded:
                        bodyContentType === 'application/x-www-form-urlencoded'
                            ? Array.from(
                                  new URLSearchParams(
                                      step.settings.body
                                  ).entries()
                              ).map(([key, value]) => ({key, value}))
                            : undefined,
                    bodyContentType: bodyContentType,
                    variables: step.settings.variables,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'shopper-authentication') {
            const node: ShopperAuthenticationNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'shopper_authentication',
                data: {
                    wfConfigurationRef: {
                        wfConfigurationShopperAuthenticationStepId: step.id,
                    },
                    integrationId: step.settings.integration_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else {
            return
        }
        // linking from previous node to the one just added
        if (previousStep) {
            const n = nodes[nodes.length - 1]
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${nodeIdByStepId[previousStep.id]}-${n.id}`,
                source: nodeIdByStepId[previousStep.id],
                target: n.id,
                ...(incomingTransition?.event?.id
                    ? {data: {event: incomingTransition.event}}
                    : {}),
            })
        } else {
            const n = nodes[nodes.length - 1]
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${triggerButtonNode.id}-${n.id}`,
                source: triggerButtonNode.id,
                target: n.id,
                ...(incomingTransition?.event?.id
                    ? {data: {event: incomingTransition.event}}
                    : {}),
            })
        }
    })
    return {
        name: c.name,
        available_languages: c.available_languages,
        nodes,
        edges,
        wfConfigurationOriginal: c,
        isNewModel,
    }
}

type ChoiceEventId = string

export class WorkflowConfigurationBuilder {
    private readonly data: WorkflowConfiguration
    private _selection: WorkflowStep
    constructor({
        name,
        initialStep: initialStepArg,
        initialMessage,
        ...configuration
    }:
        | (
              | {
                    initialStep?: never
                    initialMessage: WorkflowStepMessage['settings']['message']
                }
              | {
                    initialStep: WorkflowStep
                    initialMessage?: never
                }
          ) &
              Pick<
                  WorkflowConfiguration,
                  'name' | 'account_id' | 'entrypoint' | 'id'
              >) {
        const initialStep = initialStepArg
            ? initialStepArg
            : ({
                  id: ulid(),
                  kind: 'message',
                  settings: {
                      message: initialMessage,
                  },
              } as WorkflowStepMessage)
        this.data = {
            internal_id: ulid(),
            name,
            initial_step_id: initialStep.id,
            is_draft: false,
            steps: [initialStep],
            transitions: [],
            available_languages: ['en-US'],
            ...configuration,
        }
        this._selection = initialStep
    }

    insertChoicesStepAndSelect(
        message?: WorkflowStepChoices['settings']['message']
    ) {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    private insertChoiceAndStepTargetAndSelect(
        choiceLabel: string,
        step: WorkflowStep
    ): ChoiceEventId {
        if (this._selection?.kind !== 'choices')
            throw new Error(
                `${step.kind} step can only be inserted after choices step`
            )
        const choiceEventId = ulid()
        this._selection.settings.choices.push({
            event_id: choiceEventId,
            label: choiceLabel,
            label_tkey: ulid(),
        })
        this.data.steps.push(step)
        const transition: WorkflowTransition = {
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
            event: {id: choiceEventId, kind: 'choices'},
        }
        this.data.transitions.push(transition)
        this._selection = step
        return choiceEventId
    }

    insertChoiceAndChoicesStepAndSelect(
        choiceLabel: string,
        message: WorkflowStepChoices['settings']['message']
    ): ChoiceEventId {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndMessageStepAndSelect(
        choiceLabel: string,
        message: WorkflowStepMessage['settings']['message']
    ): ChoiceEventId {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndTextInputStepAndSelect(
        choiceLabel: string,
        settings?: WorkflowStepTextInput['settings']
    ): ChoiceEventId {
        const step: WorkflowStepTextInput = {
            id: ulid(),
            kind: 'text-input',
            settings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndAttachmentsInputStepAndSelect(
        choiceLabel: string,
        settings?: WorkflowStepAttachmentsInput['settings']
    ): ChoiceEventId {
        const step: WorkflowStepAttachmentsInput = {
            id: ulid(),
            kind: 'attachments-input',
            settings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndHandoverStepAndSelect(
        choiceLabel: string,
        handoverSettings: WorkflowStepHandover['settings'] = {}
    ): ChoiceEventId {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings: handoverSettings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndShopperAuthenticationStepAndSelect(
        choiceLabel: string,
        shopperAuthenticationSettings: WorkflowStepShopperAuthentication['settings']
    ): ChoiceEventId {
        const step: WorkflowStepShopperAuthentication = {
            id: ulid(),
            kind: 'shopper-authentication',
            settings: shopperAuthenticationSettings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertShopperAuthenticationStepAndSelect(
        settings: WorkflowStepShopperAuthentication['settings']
    ) {
        const step: WorkflowStepShopperAuthentication = {
            id: ulid(),
            kind: 'shopper-authentication',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertTextInputStepAndSelect(settings?: WorkflowStepTextInput['settings']) {
        const step: WorkflowStepTextInput = {
            id: ulid(),
            kind: 'text-input',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertAttachmentsInputStepAndSelect(
        settings?: WorkflowStepAttachmentsInput['settings']
    ) {
        const step: WorkflowStepAttachmentsInput = {
            id: ulid(),
            kind: 'attachments-input',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertMessageStepAndSelect(
        message: WorkflowStepMessage['settings']['message'],
        conditions?: WorkflowTransition['conditions']
    ) {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
            conditions,
        })
        this._selection = step
    }

    insertOrderSelectionStepAndSelect(
        settings: WorkflowStepOrderSelection['settings']
    ) {
        const step: WorkflowStepOrderSelection = {
            id: ulid(),
            kind: 'order-selection',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHttpRequestStepAndSelect(
        settings: WorkflowStepHttpRequest['settings']
    ) {
        const step: WorkflowStepHttpRequest = {
            id: ulid(),
            kind: 'http-request',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHandoverStepAndSelect(
        settings: WorkflowStepHandover['settings'] = {}
    ) {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHelpfulPromptStepAndSelect() {
        const step: WorkflowStepHelpfulPrompt = {
            id: ulid(),
            kind: 'helpful-prompt',
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    selectParentStep() {
        const parentStepId = this.data.transitions.find(
            (t) => t.to_step_id === this._selection.id
        )?.from_step_id
        if (!parentStepId) throw new Error('no parent step found')
        const parentStep = this.data.steps.find((s) => s.id === parentStepId)
        if (!parentStep)
            throw new Error('no parent step found (orphan transition)')
        this._selection = parentStep
    }

    selectStepById(stepId: string) {
        const step = this.data.steps.find((s) => s.id === stepId)
        if (!step) throw new Error('step not found')
        this._selection = step
    }

    selectInitialStep() {
        const step = this.data.steps.find(
            (s) => s.id === this.data.initial_step_id
        )
        if (!step) throw new Error('initial step missing')
        this._selection = step
    }

    build(): WorkflowConfiguration {
        return this.data
    }

    // getter for the current selection
    public get selection(): WorkflowStep {
        return this._selection
    }
}
