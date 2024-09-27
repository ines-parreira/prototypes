import {fromJS, List} from 'immutable'
import {AttachmentEnum} from 'common/types'
import {TransitoryAttachmentData} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import {
    CampaignAttachment,
    campaignAttachmentIsContactForm,
    CampaignFormExtra,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {addAttachment, deleteAttachment} from 'state/newMessage/actions'
import {TicketState} from 'state/ticket/types'
import {StoreDispatch} from 'state/types'

export const transformTransitoryToAttachment = (
    transitoryAttachmentData: TransitoryAttachmentData
): CampaignFormExtra => {
    const output: CampaignFormExtra = {} as CampaignFormExtra
    const emailForm = transitoryAttachmentData.forms.email
    const postSubmissionMessage = transitoryAttachmentData.postSubmissionMessage
    const disclaimer = emailForm.disclaimerEnabled ? emailForm.disclaimer : ''
    output.disclaimer = disclaimer
    output.disclaimer_default_accepted = emailForm.preSelectDisclaimer
    output.steps = [
        {
            cta: emailForm.cta,
            fields: [
                {
                    name: 'email',
                    type: 'email',
                    required: true,
                    label: emailForm.label,
                },
            ],
        },
    ]
    output.on_success_content = {
        message: postSubmissionMessage.enabled
            ? postSubmissionMessage.message
            : '',
    }
    output.targets = [
        {
            type: 'shopify',
            subscriber_types: ['email'],
            tags: transitoryAttachmentData.subscriberTypes.shopify.tags,
        },
    ]
    return output
}

export const transformAttachmentToTransitory = (
    attachment: CampaignFormExtra
): TransitoryAttachmentData => {
    const output = {
        forms: {},
        subscriberTypes: {},
        postSubmissionMessage: {
            enabled:
                attachment.on_success_content.message &&
                attachment.on_success_content.message !== '',
            message: attachment.on_success_content.message,
        },
    } as TransitoryAttachmentData

    attachment.steps.forEach((step) => {
        const field = step.fields[0]
        output.forms[field.type as 'email'] = {
            cta: step.cta || '',
            label: field.label,
            disclaimerEnabled:
                (attachment.disclaimer && attachment.disclaimer !== '') ||
                false,
            disclaimer: attachment.disclaimer,
            preSelectDisclaimer:
                attachment.disclaimer_default_accepted || false,
        }
    })

    attachment.targets.forEach((target) => {
        output.subscriberTypes[target.type as 'shopify'] = {
            enabled: true,
            isEmailSubscriber: target.subscriber_types.includes('email'),
            isSmsSubscriber: target.subscriber_types.includes('sms'),
            tags: target.tags || [],
        }
    })

    return output
}

export const handleContactFormSubmitted = (
    dispatch: StoreDispatch,
    attachments: List<Map<any, any>>,
    newAttachmentExtra: CampaignFormExtra,
    ticket: TicketState,
    sortAttachments: boolean
) => {
    const jsAttachments = attachments.toJS() as CampaignAttachment[]
    const prevAttachmentIdx = jsAttachments.findIndex(
        campaignAttachmentIsContactForm
    )
    if (prevAttachmentIdx >= 0) {
        dispatch(deleteAttachment(prevAttachmentIdx))
    }
    dispatch(
        addAttachment(
            ticket,
            fromJS({
                content_type: AttachmentEnum.ContactForm,
                name: 'Contact Capture Form',
                extra: newAttachmentExtra,
            }),
            sortAttachments
        )
    )
}
