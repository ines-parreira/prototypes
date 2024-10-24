import {ulid} from 'ulidx'

import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const PRODUCT_UNIQUE_ATTRIBUTES: WorkflowTemplate = {
    slug: 'product-unique-attributes',
    name: 'Product unique attributes',
    description: 'Tell customers what makes your product unique.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Product unique attributes',
            entrypoint: {
                label: '🤩 What makes [product] different from others?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: '<div>Our products are [<strong>insert your product marketing text here</strong>]. Please refer to our product page [<strong>link</strong>] for detailed information on each product.</div>',
                            text: 'Our products are [insert your product marketing text here]. Please refer to our product page [link] for detailed information on each product.',
                        },
                    },
                },
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
