import { ulid } from 'ulidx'

import { WorkflowConfigurationBuilder } from '../models/workflowConfiguration.model'
import type {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import { WorkflowTemplateLabelType } from '../models/workflowConfiguration.types'

export const SIZE_GUIDE: WorkflowTemplate = {
    slug: 'size-guide',
    name: 'Size guide',
    description:
        'Provide customers with sizing guidance based on product type.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Size guide',
            entrypoint: {
                label: '📏 How do I choose the right size?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: `<div>We&#x27;d be happy to help you with sizing! First, what type of product are you looking for?</div>`,
                            text: `We'd be happy to help you with sizing! First, what type of product are you looking for?`,
                        },
                    },
                },
            },
        })
        b.insertChoiceAndChoicesStepAndSelect('Shoes', {
            content: {
                html: `<div>What type of fit are you looking for?</div>`,
                text: `What type of fit are you looking for?`,
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Narrow', {
            content: {
                html: `<div>Here&#x27;s our size chart for the product and fit you&#x27;re looking for:</div><div><br></div><div><em>[insert size chart here as an image]</em></div>`,
                text: `Here's our size chart for the product and fit you're looking for:

[insert size chart here as an image]`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Average', {
            content: {
                html: `<div>Here&#x27;s our size chart for the product and fit you&#x27;re looking for:</div><div><br></div><div><em>[insert size chart here as an image]</em></div>`,

                text: `Here's our size chart for the product and fit you're looking for:

[insert size chart here as an image]`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Wide', {
            content: {
                html: `<div>Here&#x27;s our size chart for the product and fit you&#x27;re looking for:</div><div><br></div><div><em>[insert size chart here as an image]</em></div>`,
                text: `Here's our size chart for the product and fit you're looking for:

[insert size chart here as an image]`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Dresses', {
            content: {
                html: `<div>Our dresses generally fit true to size, so you can select your normal size based on our guide below. Be sure to check product pages for specific details on fit.</div><div><br></div><div><em>[insert size chart here as an image]</em></div><div><br></div><div><br></div>`,
                text: `Our dresses generally fit true to size, so you can select your normal size based on our guide below. Be sure to check product pages for specific details on fit.

[insert size chart here as an image]`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Shirts', {
            content: {
                html: `<div>Our shirts generally fit true to size, so you can select your normal size based on our guide below. Be sure to check product pages for specific details on fit.</div><div><br></div><div><em>[insert size chart here as an image]</em></div>`,
                text: `Our shirts generally fit true to size, so you can select your normal size based on our guide below. Be sure to check product pages for specific details on fit.

[insert size chart here as an image]`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndTextInputStepAndSelect('Something else', {
            message: {
                content: {
                    html: `<div>Please share more details on the product and fit you&#x27;re looking for so we can help you further.</div>`,
                    text: `Please share more details on the product and fit you're looking for so we can help you further.`,
                },
            },
        })
        b.insertHandoverStepAndSelect()
        return b.build()
    },
}
