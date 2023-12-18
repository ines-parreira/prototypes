import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export const ADD_CUSTOMER_TO_KLAVIYO_LIST: WorkflowTemplate = {
    slug: 'add-customer-to-klaviyo-list',
    name: 'Add customer to Klaviyo list',
    description:
        "Capture a customer or prospect's email address and add them to your Klaviyo list.",
    label: WorkflowTemplateLabelType.ThirdPartyActions,
    getConfiguration: (
        id: string,
        accountId: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Add customer to Klaviyo list',
            account_id: accountId,
            entrypoint: {
                label: 'Keep me informed about updates and promotions',
                label_tkey: ulid(),
            },
            initialMessage: {
                content: {
                    html: '<div>What&#x27;s your first name?</div>',
                    text: "What's your first name?",
                },
            },
        })
        b.insertTextInputStepAndSelect()
        const firstNameStepId = b.selection.id
        b.insertMessagesStepAndSelect([
            {
                content: {
                    html: `<div>Thanks {{steps_state.${firstNameStepId}.content.text}}. What&#x27;s your email address?</div>`,
                    text: `Thanks {{steps_state.${firstNameStepId}.content.text}}. What's your email address?`,
                },
            },
        ])
        b.insertTextInputStepAndSelect()
        const emailAddressStepId = b.selection.id
        b.insertHttpRequestStepAndSelect({
            name: 'Add customer to Klaviyo list (make sure credentials are added)',
            url: 'https://a.klaviyo.com/api/profiles',
            method: 'POST',
            headers: {
                authorization: 'Klaviyo-API-Key your-private-api-key',
                revision: '2023-10-15',
                'content-type': 'application/json',
            },
            body: `{
  "data": {
    "type": "profile",
    "attributes": {
      "email": "{{steps_state.${emailAddressStepId}.content.text}}",
      "first_name": "{{steps_state.${firstNameStepId}.content.text}}",
      "properties": {
        "newKey": "New Value"
      }
    }
  }
}`,
            variables: [],
        })
        b.insertMessagesStepAndSelect([
            {
                content: {
                    html: '<div>Thanks, you&#x27;re subscribed now! Keep an eye out for our upcoming announcements and special deals. Have a good day!</div>',
                    text: "Thanks, you're subscribed now! Keep an eye out for our upcoming announcements and special deals. Have a good day!",
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        return b.build()
    },
}
