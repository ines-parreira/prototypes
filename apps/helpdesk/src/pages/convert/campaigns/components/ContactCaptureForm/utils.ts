import type { List } from 'immutable'
import { fromJS } from 'immutable'

import { AttachmentEnum } from 'common/types'
import type { TransitoryAttachmentData } from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import type {
    AttachmentType,
    CampaignFormExtra,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {
    attachmentIsContactCaptureForm,
    ContactFormFieldType,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import { addAttachment, deleteAttachment } from 'state/newMessage/actions'
import type { TicketState } from 'state/ticket/types'
import type { StoreDispatch } from 'state/types'

export const transformTransitoryToAttachment = (
    transitoryAttachmentData: TransitoryAttachmentData,
): CampaignFormExtra => {
    const output: CampaignFormExtra = {} as CampaignFormExtra
    const emailForm = transitoryAttachmentData.forms.email
    const postSubmissionMessage = transitoryAttachmentData.postSubmissionMessage
    output.steps = [
        {
            cta: emailForm.cta,
            fields: [
                {
                    name: 'email',
                    type: ContactFormFieldType.Email,
                    required: true,
                    label: emailForm.label,
                },
            ],
        },
    ]
    output.on_success_content = {
        message: postSubmissionMessage.enabled
            ? postSubmissionMessage.message
            : undefined,
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
    attachment: CampaignFormExtra,
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
            label: field.label ?? '',
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
    sortAttachments: boolean,
) => {
    const jsAttachments = attachments.toJS() as AttachmentType[]
    const prevAttachmentIdx = jsAttachments.findIndex(
        attachmentIsContactCaptureForm,
    )
    if (prevAttachmentIdx >= 0) {
        dispatch(deleteAttachment(prevAttachmentIdx))
    }
    dispatch(
        addAttachment(
            ticket,
            fromJS({
                content_type: AttachmentEnum.ContactForm,
                name: 'Email Capture Form',
                extra: newAttachmentExtra,
            }),
            sortAttachments,
        ),
    )
}

export const findContactCaptureForm = (
    attachments: List<any>,
): CampaignFormExtra | undefined => {
    const attachmentsJS: AttachmentType[] = attachments.toJS()

    const attachment = attachmentsJS.find(attachmentIsContactCaptureForm)

    return attachment && attachment.extra ? attachment.extra : undefined
}
