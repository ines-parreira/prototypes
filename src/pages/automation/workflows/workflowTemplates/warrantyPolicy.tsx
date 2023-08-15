import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export const WARRANTY_POLICY: WorkflowTemplate = {
    slug: 'warranty-policy',
    name: 'Warranty policy',
    description: 'Provide warranty information based on product.',
    getConfiguration: (
        id: string,
        account_id: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Warranty policy',
            account_id,
            entrypoint: {
                label: `🏅 What's your warranty policy?`,
                label_tkey: ulid(),
            },
            initialMessage: {
                content: {
                    html: '<div>Warranties vary by product. Which product would you like more details on?</div>',
                    text: 'Warranties vary by product. Which product would you like more details on?',
                },
            },
        })
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('Computers', [
            {
                content: {
                    html: '<div>This product is covered up to 1 year from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>',
                    text: 'This product is covered up to 1 year from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Phones', [
            {
                content: {
                    html: `<div>This product is covered up to 90 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>`,
                    text: `This product is covered up to 90 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.`,
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Keyboards', [
            {
                content: {
                    html: '<div>This product is covered up to 30 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>',
                    text: 'This product is covered up to 30 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        return b.build()
    },
}
