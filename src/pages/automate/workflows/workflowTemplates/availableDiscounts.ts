import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const AVAILABLE_DISCOUNTS: WorkflowTemplate = {
    slug: 'available-discounts',
    name: 'Available discounts',
    description:
        'Share available discounts or loyalty program information with customers.',
    label: WorkflowTemplateLabelType.PaymentAndDiscounts,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Available discounts',
            entrypoint: {
                label: '💰 Do you offer any discounts?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: '<div>Yes! You can enjoy a X% discount on your first order and get access to exclusive orders by signing up to our newsletter.</div><div><br></div><div>[Provide instructions on how to get discount code].</div>',
                            text: `Yes! You can enjoy a X% discount on your first order and get access to exclusive orders by signing up to our newsletter.

[Provide instructions on how to get discount code].`,
                        },
                    },
                },
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
