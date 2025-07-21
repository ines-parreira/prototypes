import {
    WhatsAppMessageTemplate,
    WhatsAppMessageTemplateCategory,
    WhatsAppMessageTemplateStatus,
} from 'models/whatsAppMessageTemplates/types'

export const whatsAppMessageTemplates: WhatsAppMessageTemplate[] = [
    {
        id: 1,
        name: 'sample_purchase_feedback',
        components: {
            // header: {
            //     type: 'text',
            //     value: 'LOGIN ATTEMPT',
            // },
            body: {
                type: 'text',
                value: "Hey {{1}},\\nHere's your https://www.google.com one-time password:  *{{2}}*\\nCode expires in 30 minutes.",
            },
            footer: {
                type: 'text',
                value: 'If you never requested this code, please ignore the message.',
            },
            // buttons: [
            //     {
            //         type: 'url',
            //         value: 'https://app.mobile.me.app/{{1}}',
            //     },
            // ],
        },
        is_supported: true,
        category: WhatsAppMessageTemplateCategory.Marketing,
        external_id: '1184662202111735',
        language: 'en',
        status: WhatsAppMessageTemplateStatus.Approved,
        rejected_reason: null,
        quality_score: 'UNKNOWN',
        waba_id: '123128413183132',
        created_datetime: '2023-12-01T18:00:00.000000+00:00',
        updated_datetime: '2023-12-01T18:00:00.000000+00:00',
        deactivated_datetime: null,
    },
    {
        id: 2,
        name: 'rejected_template_sample',
        components: {
            // header: {
            //     type: 'text',
            //     value: 'LOGIN ATTEMPT',
            // },
            body: {
                type: 'text',
                value: "Here's the rejected template content {{1}}",
            },
            footer: {
                type: 'text',
                value: 'If you never requested this code, please ignore the message.',
            },
            // buttons: [
            //     {
            //         type: 'url',
            //         value: 'https://app.mobile.me.app/{{1}}',
            //     },
            // ],
        },
        category: WhatsAppMessageTemplateCategory.Utility,
        external_id: '22',
        language: 'ca',
        status: WhatsAppMessageTemplateStatus.Rejected,
        is_supported: true,
        waba_id: '12312841318123',
        rejected_reason: 'INVALID_FORMAT',
        quality_score: 'UNKNOWN',
        created_datetime: '2023-12-01T18:00:00.000000+00:00',
        updated_datetime: '2023-12-01T18:00:00.000000+00:00',
        deactivated_datetime: '2023-12-01T18:00:00.000000+00:00',
    },
]
