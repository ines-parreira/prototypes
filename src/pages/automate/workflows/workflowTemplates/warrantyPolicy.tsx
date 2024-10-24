import {ulid} from 'ulidx'

import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const WARRANTY_POLICY: WorkflowTemplate = {
    slug: 'warranty-policy',
    name: 'Warranty policy',
    description: 'Provide warranty information based on product.',
    label: WorkflowTemplateLabelType.Policies,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Warranty policy',
            entrypoint: {
                label: `🏅 What's your warranty policy?`,
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: '<div>Warranties vary by product. Which product would you like more details on?</div>',
                            text: 'Warranties vary by product. Which product would you like more details on?',
                        },
                    },
                },
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Computers', {
            content: {
                html: '<div>This product is covered up to 1 year from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>',
                text: 'This product is covered up to 1 year from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Phones', {
            content: {
                html: `<div>This product is covered up to 90 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>`,
                text: `This product is covered up to 90 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Keyboards', {
            content: {
                html: '<div>This product is covered up to 30 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.</div>',
                text: 'This product is covered up to 30 days from date of purchase. We provide repairs or replacements at no cost if the product is still under warranty.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
