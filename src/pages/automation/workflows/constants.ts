import {ulid} from 'ulidx'

import colors from 'assets/tokens/colors.json'

import {
    WorkflowConfiguration,
    WorkflowStepChoices,
    WorkflowStepMessages,
    WorkflowStepWorkflowCall,
    WorkflowTemplate,
    WorkflowTransition,
} from './models/workflowConfiguration.types'
import {VisualBuilderNode} from './models/visualBuilderGraph.types'

export const colorByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'trigger_button' | 'end'>,
    {color: string; backgroundColor: string}
> = {
    automated_message: {
        color: colors['📺 Classic'].Accessory.Purple_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Pink_bg.value,
    },
    multiple_choices: {
        color: colors['📺 Classic'].Main.Variations.Primary_4.value,
        backgroundColor: colors['📺 Classic'].Accessory.Blue_bg.value,
    },
    text_reply: {
        color: colors['📺 Classic'].Accessory.Brown_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Orange_bg.value,
    },
    file_upload: {
        color: colors['📺 Classic'].Accessory.Green_text.value,
        backgroundColor: colors['📺 Classic'].Accessory.Green_bg.value,
    },
}

export const materialIconByVisualBuilderNodeType: Record<
    Exclude<NonNullable<VisualBuilderNode['type']>, 'trigger_button' | 'end'>,
    string
> = {
    automated_message: 'chat_bubble',
    multiple_choices: 'view_list',
    text_reply: 'short_text',
    file_upload: 'attach_file',
}

export const WAS_THIS_HELPFUL_WORKFLOW_ID = '01GWPRH2G05DYYFBB1GNVNRB19'

export const WORKFLOW_TEMPLATES: Record<
    WorkflowTemplate['slug'],
    WorkflowTemplate
> = {
    'product-recommendation': {
        slug: 'product-recommendation',
        name: 'Product recommendation',
        description:
            'Ask customers questions and recommend specific products based on their answers.',
        getConfiguration: (
            id: string,
            account_id: number
        ): WorkflowConfiguration => {
            const stepFirstId = ulid()
            const stepFirstChoicesId = ulid()
            const stepWhereId = ulid()
            const stepWhereChoicesId = ulid()
            const eventWhereId = ulid()
            const stepWhatId = ulid()
            const stepWhatChoicesId = ulid()
            const eventWhatId = ulid()
            const stepOutdoorsId = ulid()
            const eventOutdoorsId = ulid()
            const stepIndoorsId = ulid()
            const eventIndoorsId = ulid()
            const stepRunningId = ulid()
            const eventRunningId = ulid()
            const stepCrossTrainingId = ulid()
            const eventCrossTrainingId = ulid()
            const workflowCallOutdoorStepId = ulid()
            const workflowCallIndoorStepId = ulid()
            const workflowCallRunningStepId = ulid()
            const workflowCallCrossTrainingStepId = ulid()
            const genMessagesStep = (
                id: string,
                text: string
            ): WorkflowStepMessages => ({
                id,
                kind: 'messages',
                settings: {
                    messages: [
                        {
                            content: {
                                html: text,
                                html_tkey: ulid(),
                                text,
                                text_tkey: ulid(),
                            },
                        },
                    ],
                },
            })
            const genChoicesStep = (
                id: string,
                choices: WorkflowStepChoices['settings']['choices']
            ): WorkflowStepChoices => ({
                id,
                kind: 'choices',
                settings: {
                    choices,
                },
            })
            const genWasThisHelpfulCallStep = (
                id: string
            ): WorkflowStepWorkflowCall => ({
                id,
                kind: 'workflow_call',
                settings: {
                    configuration_id: WAS_THIS_HELPFUL_WORKFLOW_ID,
                },
            })
            const genTransition = (
                from_step_id: string,
                to_step_id: string,
                event_id?: string
            ): WorkflowTransition => ({
                id: ulid(),
                from_step_id,
                to_step_id,
                event: event_id ? {id: event_id, kind: 'choices'} : null,
            })
            return {
                id,
                internal_id: ulid(),
                name: 'Shoe recommendation',
                account_id,
                is_draft: false,
                initial_step_id: stepFirstId,
                entrypoint: {
                    label: 'What shoe is right for me?',
                    label_tkey: ulid(),
                },
                steps: [
                    genMessagesStep(
                        stepFirstId,
                        'How much cushion are you looking for?'
                    ),
                    genChoicesStep(stepFirstChoicesId, [
                        {
                            event_id: eventWhereId,
                            label: 'Light cushion',
                            label_tkey: ulid(),
                        },
                        {
                            event_id: eventWhatId,
                            label: 'Medium cushion',
                            label_tkey: ulid(),
                        },
                    ]),
                    genMessagesStep(
                        stepWhereId,
                        'Where are you planning to use them most?'
                    ),
                    genMessagesStep(
                        stepWhatId,
                        'What kinds of activities will you be doing?'
                    ),
                    genChoicesStep(stepWhereChoicesId, [
                        {
                            event_id: eventOutdoorsId,
                            label: 'Outdoors',
                            label_tkey: ulid(),
                        },
                        {
                            event_id: eventIndoorsId,
                            label: 'Indoors',
                            label_tkey: ulid(),
                        },
                    ]),
                    genChoicesStep(stepWhatChoicesId, [
                        {
                            event_id: eventRunningId,
                            label: 'Running',
                            label_tkey: ulid(),
                        },
                        {
                            event_id: eventCrossTrainingId,
                            label: 'Cross-training',
                            label_tkey: ulid(),
                        },
                    ]),
                    genMessagesStep(
                        stepOutdoorsId,
                        'We recommend you go with shoe A'
                    ),
                    genMessagesStep(
                        stepIndoorsId,
                        'We recommend you go with shoe B'
                    ),
                    genMessagesStep(
                        stepRunningId,
                        'We recommend you go with shoe C'
                    ),
                    genMessagesStep(
                        stepCrossTrainingId,
                        'We recommend you go with shoe D'
                    ),
                    genWasThisHelpfulCallStep(workflowCallOutdoorStepId),
                    genWasThisHelpfulCallStep(workflowCallIndoorStepId),
                    genWasThisHelpfulCallStep(workflowCallRunningStepId),
                    genWasThisHelpfulCallStep(workflowCallCrossTrainingStepId),
                ],
                transitions: [
                    genTransition(stepFirstId, stepFirstChoicesId),
                    genTransition(
                        stepFirstChoicesId,
                        stepWhereId,
                        eventWhereId
                    ),
                    genTransition(stepFirstChoicesId, stepWhatId, eventWhatId),
                    genTransition(stepWhereId, stepWhereChoicesId),
                    genTransition(stepWhatId, stepWhatChoicesId),
                    genTransition(
                        stepWhereChoicesId,
                        stepOutdoorsId,
                        eventOutdoorsId
                    ),
                    genTransition(
                        stepWhereChoicesId,
                        stepIndoorsId,
                        eventIndoorsId
                    ),
                    genTransition(
                        stepWhatChoicesId,
                        stepRunningId,
                        eventRunningId
                    ),
                    genTransition(
                        stepWhatChoicesId,
                        stepCrossTrainingId,
                        eventCrossTrainingId
                    ),
                    genTransition(stepOutdoorsId, workflowCallOutdoorStepId),
                    genTransition(stepIndoorsId, workflowCallIndoorStepId),
                    genTransition(stepRunningId, workflowCallRunningStepId),
                    genTransition(
                        stepCrossTrainingId,
                        workflowCallCrossTrainingStepId
                    ),
                ],
            }
        },
    },
}
export const WORKFLOW_TEMPLATES_LIST = Object.values(WORKFLOW_TEMPLATES)
