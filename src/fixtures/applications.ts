import {Application} from 'models/application/types'

export const applications: Application[] = [
    {
        id: '64785607477d0a11fc731bfa',
        channel_id: '4a2c595c-99b8-45d4-a6b2-a8541538aab0',
        messaging_config: {
            attachments: {
                allowed_mime_types: ['jpeg', 'mp4', 'webm'],
                alongside_text_allowed: false,
                max_amount: 1.0,
                supported: true,
            },
            supports_replies: true,
            supports_ticket_initiation: true,
        },
        name: 'TikTok Shop',
        status: 'approved',
        deactivated_datetime: null,
    },
    {
        id: 'rHLnDofy6o9Rlnc79OKprR0gGz847',
        channel_id: 'b7fbed27-5dda-44df-a967-18e3d3bcdf00',
        messaging_config: {
            attachments: {
                allowed_mime_types: ['jpeg', 'mp4', 'webm'],
                alongside_text_allowed: false,
                max_amount: 1.0,
                supported: true,
            },
            supports_replies: true,
            supports_ticket_initiation: false,
        },
        name: 'Fake App',
        status: 'approved',
        deactivated_datetime: null,
    },
]
