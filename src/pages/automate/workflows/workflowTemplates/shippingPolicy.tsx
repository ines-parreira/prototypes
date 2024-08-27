import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const SHIPPING_POLICY: WorkflowTemplate = {
    slug: 'shipping-policy',
    name: 'Shipping policy',
    description:
        'Give shipping policy details to customers based location and method.',
    label: WorkflowTemplateLabelType.Policies,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Shipping policy',
            entrypoint: {
                label: `🚚 What's your shipping policy?`,
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: '<div>Delivery cost and times vary based on location and method. First, what is your shipping location?</div>',
                            text: 'Delivery cost and times vary based on location and method. First, what is your shipping location?',
                        },
                    },
                },
            },
        })
        b.insertChoiceAndMessageStepAndSelect('US', {
            content: {
                html: '<div>We offer free standard US 5-day shipping and express US 2-day delivery for a $20 fee.</div>',
                text: 'We offer free standard US 5-day shipping and express US 2-day delivery for a $20 fee.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Europe', {
            content: {
                html: `<div>We offer only one shipping option for deliveries to Europe. Packages may take up to 10 business days to be delivered, and shipping cost is estimated at checkout.</div>`,
                text: `We offer only one shipping option for deliveries to Europe. Packages may take up to 10 business days to be delivered, and shipping cost is estimated at checkout.`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Australia / New zealand', {
            content: {
                html: '<div>Deliveries to Australia or New Zealand take up to 15 business days to deliver, and shipping cost is estimated at checkout.</div>',
                text: 'Deliveries to Australia or New Zealand take up to 15 business days to deliver, and shipping cost is estimated at checkout.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
