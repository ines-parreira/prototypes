import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const PRODUCT_INGREDIENTS: WorkflowTemplate = {
    slug: 'product-ingredients',
    name: 'Product ingredients',
    description: 'Tell customers about the ingredients used in your products.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (
        id: string,
        accountId: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Product ingredients',
            account_id: accountId,
            entrypoint: {
                label: '🤔 What type of ingredients do you use?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: '<div>Our products are made from [<strong>insert relevant text from the product description</strong>]. Please refer to our product page [<strong>link</strong>] for detailed information on each product.</div>',
                            text: 'Our products are made from [insert relevant text from the product description]. Please refer to our product page [link] for detailed information on each product.',
                        },
                    },
                },
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
