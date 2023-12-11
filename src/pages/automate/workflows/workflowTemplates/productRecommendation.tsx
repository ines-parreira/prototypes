import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export const PRODUCT_RECOMMENDATION: WorkflowTemplate = {
    slug: 'product-recommendation',
    name: 'Product recommendation',
    description:
        'Ask customers questions and recommend specific products based on their answers.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (
        id: string,
        account_id: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Product recommendation',
            account_id,
            entrypoint: {
                label: 'What shoe is right for me?',
                label_tkey: ulid(),
            },
            initialMessage: {
                content: {
                    html: 'How much cushion are you looking for?',
                    text: 'How much cushion are you looking for?',
                },
            },
        })
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('Light cushion', [
            {
                content: {
                    html: 'Where are you planning to use them most?',
                    text: 'Where are you planning to use them most?',
                },
            },
        ])
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('Outdoors', [
            {
                content: {
                    html: 'We recommend you go with shoe A',
                    text: 'We recommend you go with shoe A',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Indoors', [
            {
                content: {
                    html: 'We recommend you go with shoe B',
                    text: 'We recommend you go with shoe B',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Medium cushion', [
            {
                content: {
                    html: 'What kinds of activities will you be doing?',
                    text: 'What kinds of activities will you be doing?',
                },
            },
        ])
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('Running', [
            {
                content: {
                    html: 'We recommend you go with shoe C',
                    text: 'We recommend you go with shoe C',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Cross-training', [
            {
                content: {
                    html: 'We recommend you go with shoe D',
                    text: 'We recommend you go with shoe D',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        return b.build()
    },
}
