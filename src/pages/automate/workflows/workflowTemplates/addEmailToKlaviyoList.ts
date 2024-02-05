import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const ADD_EMAIL_TO_KLAVIYO_LIST: WorkflowTemplate = {
    slug: 'add-email-to-klaviyo-list',
    name: 'Add email to Klaviyo list',
    description: 'Requires HTTP request set up and Klaviyo account.',
    label: WorkflowTemplateLabelType.ThirdPartyActions,
    getConfiguration: (
        id: string,
        accountId: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Add email to Klaviyo list',
            account_id: accountId,
            entrypoint: {
                label: 'Keep me informed about updates and promotions',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'text-input',
                settings: {
                    message: {
                        content: {
                            html: '<div>What&#x27;s your first name?</div>',
                            text: "What's your first name?",
                        },
                    },
                },
            },
        })
        const firstNameStepId = b.selection.id
        b.insertTextInputStepAndSelect({
            message: {
                content: {
                    html: `<div>Thanks {{steps_state.${firstNameStepId}.content.text}}. What&#x27;s your email address?</div>`,
                    text: `Thanks {{steps_state.${firstNameStepId}.content.text}}. What's your email address?`,
                },
            },
        })
        const emailAddressStepId = b.selection.id
        b.insertHttpRequestStepAndSelect({
            name: 'Add customer to Klaviyo list (make sure credentials are added)',
            url: 'https://a.klaviyo.com/api/profiles',
            method: 'POST',
            headers: {
                authorization: '',
                revision: '2023-10-15',
                'content-type': 'application/json',
                'gorgias-message':
                    'To enable this flow, insert your Klaviyo credentials next to the "authorization" header per documentation: https://developers.klaviyo.com/en/reference/create_profile',
                'gorgias-message-2':
                    'Before enabling flow, make sure to delete all "gorgias-message" headers',
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
        b.insertMessageStepAndSelect({
            content: {
                html: '<div>Thanks, you&#x27;re subscribed now! Keep an eye out for our upcoming announcements and special deals. Have a good day!</div>',
                text: "Thanks, you're subscribed now! Keep an eye out for our upcoming announcements and special deals. Have a good day!",
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
