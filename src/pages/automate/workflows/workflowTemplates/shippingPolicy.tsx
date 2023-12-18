import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export const SHIPPING_POLICY: WorkflowTemplate = {
    slug: 'shipping-policy',
    name: 'Shipping policy',
    description:
        'Give shipping policy details to customers based location and method.',
    label: WorkflowTemplateLabelType.Policies,
    getConfiguration: (
        id: string,
        accountId: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Shipping policy',
            account_id: accountId,
            entrypoint: {
                label: `🚚 What's your shipping policy?`,
                label_tkey: ulid(),
            },
            initialMessage: {
                content: {
                    html: '<div>Delivery cost and times vary based on location and method. First, what is your shipping location?</div>',
                    text: 'Delivery cost and times vary based on location and method. First, what is your shipping location?',
                },
            },
        })
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('US', [
            {
                content: {
                    html: '<div>We offer free standard US 5-day shipping and express US 2-day delivery for a $20 fee.</div>',
                    text: 'We offer free standard US 5-day shipping and express US 2-day delivery for a $20 fee.',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Europe', [
            {
                content: {
                    html: `<div>We offer only one shipping option for deliveries to Europe. Packages may take up to 10 business days to be delivered, and shipping cost is estimated at checkout.</div>`,
                    text: `We offer only one shipping option for deliveries to Europe. Packages may take up to 10 business days to be delivered, and shipping cost is estimated at checkout.`,
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('Australia / New zealand', [
            {
                content: {
                    html: '<div>Deliveries to Australia or New Zealand take up to 15 business days to deliver, and shipping cost is estimated at checkout.</div>',
                    text: 'Deliveries to Australia or New Zealand take up to 15 business days to deliver, and shipping cost is estimated at checkout.',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        return b.build()
    },
}
