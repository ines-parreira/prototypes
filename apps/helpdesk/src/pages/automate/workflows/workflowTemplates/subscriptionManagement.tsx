import { ulid } from 'ulidx'

import { WorkflowConfigurationBuilder } from '../models/workflowConfiguration.model'
import type {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import { WorkflowTemplateLabelType } from '../models/workflowConfiguration.types'

export const SUBSCRIPTION_MANAGEMENT: WorkflowTemplate = {
    slug: 'subscription-management',
    name: 'Subscription management',
    description: 'Help customers make changes to their subscriptions.',
    label: WorkflowTemplateLabelType.SubscriptionManagement,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Subscription management',
            entrypoint: {
                label: `🗓️ I need help managing my subscription`,
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: '<div>How can we help you with your subscription?</div>',
                            text: 'How can we help you with your subscription?',
                        },
                    },
                },
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Change Frequency', {
            content: {
                html: `<div>Follow these steps to update your subscription frequency:</div><div><br></div><div>1. Log into your account <em>(link here)</em></div><div>2. Update your shipping frequency</div><div>3. Confirm your changes</div>`,
                text: `Follow these steps to update your subscription frequency:

1. Log into your account (link here)
2. Update your shipping frequency
3. Confirm your changes`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Change Products', {
            content: {
                html: `<div>Follow these steps to change the products in your subscription:</div><div><br></div><div>1. Log into your account <em>(link here)</em></div><div>2. Add or remove the desired products</div><div>4. Confirm your selection</div>`,
                text: `Follow these steps to change the products in your subscription:

1. Log into your account (link here)
2. Add or remove the desired products
4. Confirm your selection`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndChoicesStepAndSelect('Update delivery details', {
            content: {
                html: `<div>What would you like to do?</div>`,
                text: `What would you like to do?`,
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Change my shipping address', {
            content: {
                html: `<div>Follow these steps to change your shipping address:</div><div><br></div><div>1. Log into your account <em>(link here)</em></div><div>2. Select &quot;update account information&quot;</div><div>3. Update your shipping address</div><div>4. Confirm your selection</div>`,
                text: `Follow these steps to change your shipping address:

1. Log into your account (link here)
2. Select "update account information"
3. Update your shipping address
4. Confirm your selection`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Update delivery instructions', {
            content: {
                html: `<div>Follow these steps to change your delivery date:</div><div><br></div><div>1. Log into your account</div><div>2. Select &quot;update account information&quot;</div><div>3. Add special instructions for delivery</div><div>4. Save changes</div>`,
                text: `Follow these steps to change your delivery date:

1. Log into your account
2. Select "update account information"
3. Add special instructions for delivery
4. Save changes`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Change payment information', {
            content: {
                html: `F<div>Follow these steps to change your payment information:</div><div><br></div><div>1. Log into your account <em>(link here)</em></div><div>2. Select &quot;update account information&quot;</div><div>3. Update your payment method</div><div>4. Confirm your selection</div>`,
                text: `Follow these steps to change your payment information:

1. Log into your account (link here)
2. Select "update account information"
3. Update your payment method
4. Confirm your selection`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Cancel subscription', {
            content: {
                html: `<div>We&#x27;re sorry you&#x27;d like to cancel your subscription! Please follow these steps:</div><div><br></div><div>1. Log into your account <em>(link here)</em></div><div>2. Select &quot;update account information&quot;</div><div>3. Select &quot;cancel subscription&quot;</div><div>4. Confirm your selection</div>`,
                text: `We're sorry you'd like to cancel your subscription! Please follow these steps:

1. Log into your account (link here)
2. Select "update account information"
3. Select "cancel subscription"
4. Confirm your selection`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
