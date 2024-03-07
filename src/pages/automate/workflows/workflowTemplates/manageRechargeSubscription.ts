import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const MANAGE_RECHARGE_SUBSCRIPTION: WorkflowTemplate = {
    slug: 'manage-recharge-subscription',
    name: 'Manage Recharge Subscription',
    description: 'Requires HTTP request set up and Recharge account.',
    label: WorkflowTemplateLabelType.ThirdPartyActions,
    getConfiguration: (
        id: string,
        accountId: number,
        integrationId: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Manage Recharge Subscription',
            account_id: accountId,
            entrypoint: {
                label: "I'd like to manage my subscription",
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'shopper-authentication',
                settings: {
                    integration_id: integrationId,
                },
            },
        })
        const shopperAuthenticationStepId = b.selection.id
        const rechargeCustomerIdVariableId = ulid()
        b.insertHttpRequestStepAndSelect({
            name: 'Get Recharge customer ID (make sure credentials are added)',
            url: `https://api.rechargeapps.com/customers?email={{steps_state.${shopperAuthenticationStepId}.customer.email}}`,
            method: 'GET',
            headers: {
                'x-recharge-version': '2021-11',
                'x-recharge-access-token': '',
                'gorgias-message':
                    'To enable this flow, make sure to add your API token next to the "x-recharge-access-token" header per documentation: https://developer.rechargepayments.com/2021-11/authentication',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
            },
            variables: [
                {
                    id: rechargeCustomerIdVariableId,
                    name: 'recharge_customer_id',
                    jsonpath: '$.customers[0].id',
                    data_type: 'number',
                },
            ],
        })
        const rechargeCustomerIdHttpRequestStepId = b.selection.id
        const rechargeSubscriptionIdVariableId = ulid()
        const rechargeAddressIdVariableId = ulid()
        b.insertHttpRequestStepAndSelect({
            name: 'Get Recharge subscription and address ID (make sure credentials are added)',
            url: `https://api.rechargeapps.com/subscriptions?customer_id={{steps_state.${rechargeCustomerIdHttpRequestStepId}.content.${rechargeCustomerIdVariableId}}}`,
            method: 'GET',
            headers: {
                'x-recharge-version': '2021-11',
                'x-recharge-access-token': '',
                'gorgias-message':
                    'To enable this flow, make sure to add your API token next to the "x-recharge-access-token" header per documentation: https://developer.rechargepayments.com/2021-11/authentication',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
            },
            variables: [
                {
                    id: rechargeSubscriptionIdVariableId,
                    name: 'recharge_subscription_id',
                    jsonpath: '$.subscriptions[0].id',
                    data_type: 'string',
                },
                {
                    id: rechargeAddressIdVariableId,
                    name: 'recharge_address_id',
                    jsonpath: '$.subscriptions[0].address_id',
                    data_type: 'number',
                },
            ],
        })
        const rechargeSubscriptionHttpRequestStepId = b.selection.id
        b.insertChoicesStepAndSelect({
            content: {
                html: '<div>What would you like to do with your subscription?</div>',
                text: 'What would you like to do with your subscription?',
            },
        })
        b.insertChoiceAndTextInputStepAndSelect('Update email address', {
            message: {
                content: {
                    html: '<div>What&#x27;s your new email address?</div>',
                    text: "What's your new email address?",
                },
            },
        })
        const newEmailAddressTextInputStepId = b.selection.id
        b.insertHttpRequestStepAndSelect({
            name: "Update customer's email address (make sure credentials are added)",
            url: `https://api.rechargeapps.com/customers/{{steps_state.${rechargeCustomerIdHttpRequestStepId}.content.${rechargeCustomerIdVariableId}}}`,
            method: 'PUT',
            headers: {
                'x-recharge-version': '2021-11',
                'x-recharge-access-token': '',
                'content-type': 'application/json',
                'gorgias-message':
                    'To enable this flow, make sure to add your API token next to the "x-recharge-access-token" header per documentation: https://developer.rechargepayments.com/2021-11/authentication',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
            },
            body: `{
  "email": "{{steps_state.${newEmailAddressTextInputStepId}.content.text}}"
}`,
            variables: [],
        })
        b.insertMessageStepAndSelect({
            content: {
                html: `<div>Your email has been updated to {{steps_state.${newEmailAddressTextInputStepId}.content.text}}!</div>`,
                text: `Your email has been updated to {{steps_state.${newEmailAddressTextInputStepId}.content.text}}!`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndTextInputStepAndSelect('Update shipping address', {
            message: {
                content: {
                    html: '<div>What&#x27;s your new street and address? (e.g. 123 Alphabet St.)</div>',
                    text: "What's your new street and address? (e.g. 123 Alphabet St.)",
                },
            },
        })
        const address1TextInputStepId = b.selection.id
        b.insertTextInputStepAndSelect({
            message: {
                content: {
                    html: '<div>Any additional information about your street? (e.g. apartment #). If not applicable, simply add &quot;N/A&quot;.</div>',
                    text: 'Any additional information about your street? (e.g. apartment #). If not applicable, simply add "N/A".',
                },
            },
        })
        const address2TextInputStepId = b.selection.id
        b.insertTextInputStepAndSelect({
            message: {
                content: {
                    html: '<div>What&#x27;s your ZIP code?</div>',
                    text: "What's your ZIP code?",
                },
            },
        })
        const zipTextInputStepId = b.selection.id
        b.insertTextInputStepAndSelect({
            message: {
                content: {
                    html: '<div>What&#x27;s the city?</div>',
                    text: "What's the city?",
                },
            },
        })
        const cityTextInputStepId = b.selection.id
        b.insertTextInputStepAndSelect({
            message: {
                content: {
                    html: '<div>What&#x27;s the state? (e.g. NY, CA)</div>',
                    text: "What's the state? (e.g. NY, CA)",
                },
            },
        })
        const stateTextInputStepId = b.selection.id
        b.insertHttpRequestStepAndSelect({
            name: "Update customer's shipping address",
            url: `https://api.rechargeapps.com/addresses/{{steps_state.${rechargeSubscriptionHttpRequestStepId}.content.${rechargeAddressIdVariableId}}}`,
            method: 'PUT',
            headers: {
                'x-recharge-version': '2021-11',
                'x-recharge-access-token': '',
                'content-type': 'application/json',
                'gorgias-message':
                    'To enable this flow, make sure to add your API token next to the "x-recharge-access-token" header per documentation: https://developer.rechargepayments.com/2021-11/authentication',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
            },
            body: `{
    "address1": "{{steps_state.${address1TextInputStepId}.content.text}}",
    "address2": "{{steps_state.${address2TextInputStepId}.content.text}}",
    "city": "{{steps_state.${cityTextInputStepId}.content.text}}",
    "province": "{{steps_state.${stateTextInputStepId}.content.text}}",
    "zip": "{{steps_state.${zipTextInputStepId}.content.text}}"
}`,
            variables: [],
        })
        b.insertMessageStepAndSelect({
            content: {
                html: `<div>Your shipping address has been updated!</div><div>-Street and number: {{steps_state.${address1TextInputStepId}.content.text}} </div><div>-Additional info: {{steps_state.${address2TextInputStepId}.content.text}} </div><div>-ZIP code: {{steps_state.${zipTextInputStepId}.content.text}} </div><div>-City: {{steps_state.${cityTextInputStepId}.content.text}} </div><div>-State: {{steps_state.${stateTextInputStepId}.content.text}} </div>`,
                text: `Your shipping address has been updated!
-Street and number: {{steps_state.${address1TextInputStepId}.content.text}}
-Additional info: {{steps_state.${address2TextInputStepId}.content.text}}
-ZIP code: {{steps_state.${zipTextInputStepId}.content.text}}
-City: {{steps_state.${cityTextInputStepId}.content.text}}
-State: {{steps_state.${stateTextInputStepId}.content.text}} `,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndTextInputStepAndSelect('Cancel my subscription', {
            message: {
                content: {
                    html: '<div>We&#x27;re sorry you&#x27;d like to cancel your subscription. Could you tell us why you want to cancel?</div>',
                    text: "We're sorry you'd like to cancel your subscription. Could you tell us why you want to cancel?",
                },
            },
        })
        const cancellationReasonTextInputStepId = b.selection.id
        b.insertHttpRequestStepAndSelect({
            name: 'Cancel subscription (make sure credentials are added)',
            url: `https://api.rechargeapps.com/subscriptions/{{steps_state.${rechargeSubscriptionHttpRequestStepId}.content.${rechargeSubscriptionIdVariableId}}}/cancel`,
            method: 'POST',
            headers: {
                'x-recharge-version': '2021-11',
                'x-recharge-access-token': '',
                'content-type': 'application/json',
                'gorgias-message':
                    'To enable this flow, make sure to add your API token next to the "x-recharge-access-token" header per documentation: https://developer.rechargepayments.com/2021-11/authentication',
                'gorgias-message-2':
                    'Before enabling this flow, make sure to delete all "gorgias-message" headers',
            },
            body: `{
    "cancellation_reason": "{{steps_state.${cancellationReasonTextInputStepId}.content.text}}",
    "send_email": "true"
}`,
            variables: [],
        })
        b.insertMessageStepAndSelect({
            content: {
                html: `<div>Your subscription has been canceled and we sent a confirmation to {{steps_state.${shopperAuthenticationStepId}.customer.email}}.</div><div><br></div><div><strong>Note:</strong> you will not receive a confirmation email if any of the following apply:</div><div>- Your subscription was created today </div><div>- Your subscription is for a membership</div><div>- You received an email about this subscription in the last 24 hours</div><div>- You have other active subscriptions</div>`,
                text: `Your subscription has been canceled and we sent a confirmation to {{steps_state.${shopperAuthenticationStepId}.customer.email}}.

Note: you will not receive a confirmation email if any of the following apply:
- Your subscription was created today
- Your subscription is for a membership
- You received an email about this subscription in the last 24 hours
- You have other active subscriptions`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndTextInputStepAndSelect('Something else', {
            message: {
                content: {
                    html: '<div>Let us know what we can help you with and our team will be in touch.</div>',
                    text: 'Let us know what we can help you with and our team will be in touch.',
                },
            },
        })
        b.insertHandoverStepAndSelect()
        return b.build()
    },
}
