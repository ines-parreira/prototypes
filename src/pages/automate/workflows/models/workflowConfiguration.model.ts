import {ulid} from 'ulidx'
import _omit from 'lodash/omit'
import {getHttpRequestSuccessConditions} from '../hooks/useVisualBuilderGraphReducer/utils'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from './visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    ConditionsNodeType,
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

    walkWorkflowConfigurationGraph(c, c.initial_step_id, (step, context) => {
        const {previousStep, incomingTransition} = context

        if (step.kind === 'message') {
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'automated_message',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'choices') {
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
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'text-input') {
            const n: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'text_reply',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'attachments-input') {
            const n: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'file_upload',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'order-selection') {
            const n: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_selection',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'conditions') {
            const n: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'conditions',
                data: {
                    name: step.settings.name,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'helpful-prompt') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'ask-for-feedback',
                    ticketTags: step.settings?.ticket_tags,
                    ticketAssigneeUserId:
                        step.settings?.ticket_assignee_user_id,
                    ticketAssigneeTeamId:
                        step.settings?.ticket_assignee_team_id,
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
                    action: 'create-ticket',
                    ticketTags: step.settings.ticket_tags,
                    ticketAssigneeUserId: step.settings.ticket_assignee_user_id,
                    ticketAssigneeTeamId: step.settings.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'end') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'end',
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
                    integrationId: step.settings.integration_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else {
            return
        }
        // linking from previous node to the one just added
        const n = nodes[nodes.length - 1]
        if (previousStep) {
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${nodeIdByStepId[previousStep.id]}-${n.id}`,
                source: nodeIdByStepId[previousStep.id],
                target: n.id,
                data: {
                    event: incomingTransition?.event,
                    name: incomingTransition?.name,
                    conditions: incomingTransition?.conditions,
                },
            })
        } else {
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${triggerButtonNode.id}-${n.id}`,
                source: triggerButtonNode.id,
                target: n.id,
            })
        }
    })

    return {
        name: c.name,
        available_languages: c.available_languages,
        nodes,
        edges,
        wfConfigurationOriginal: c,
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
        message: WorkflowStepChoices['settings']['message']
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
        settings: WorkflowStepTextInput['settings']
    ): ChoiceEventId {
        const step: WorkflowStepTextInput = {
            id: ulid(),
            kind: 'text-input',
            settings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    private insertConditionsAndStepTargetAndSelect(
        step: WorkflowStep,
        conditionName: string,
        conditions?: WorkflowTransition['conditions']
    ) {
        if (
            this._selection?.kind !== 'conditions' &&
            this._selection?.kind !== 'http-request'
        )
            throw new Error(
                `${step.kind} step can only be inserted after conditions or http-request step`
            )
        this.data.steps.push(step)
        const transition: WorkflowTransition = {
            id: ulid(),
            name: conditionName,
            conditions,
            from_step_id: this._selection.id,
            to_step_id: step.id,
        }
        this.data.transitions.push(transition)
        this._selection = step
    }

    insertHttpRequestConditionAndHandOverStepAndSelect(
        type: 'error' | 'success',
        settings: WorkflowStepHandover['settings'] = {}
    ) {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getHttpRequestSuccessConditions(this._selection.id)
                : undefined
        )
    }

    insertHttpRequestConditionAndHttpRequestStepAndSelect(
        type: 'error' | 'success',
        settings: WorkflowStepHttpRequest['settings']
    ) {
        const step: WorkflowStepHttpRequest = {
            id: ulid(),
            kind: 'http-request',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getHttpRequestSuccessConditions(this._selection.id)
                : undefined
        )
    }

    insertHttpRequestConditionAndMultipleChoiceStepAndSelect(
        type: 'error' | 'success',
        message: WorkflowStepChoices['settings']['message']
    ) {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getHttpRequestSuccessConditions(this._selection.id)
                : undefined
        )
    }

    insertHttpRequestConditionAndMessageStepAndSelect(
        type: 'error' | 'success',
        message: WorkflowStepMessage['settings']['message']
    ) {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getHttpRequestSuccessConditions(this._selection.id)
                : undefined
        )
    }

    insertChoiceAndAttachmentsInputStepAndSelect(
        choiceLabel: string,
        settings: WorkflowStepAttachmentsInput['settings']
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

    insertTextInputStepAndSelect(settings: WorkflowStepTextInput['settings']) {
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
        settings: WorkflowStepAttachmentsInput['settings']
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
