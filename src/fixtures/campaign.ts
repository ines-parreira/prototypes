export const campaignId = 'ee869594-65e2-45a5-a759-a4660c9ce677'

export const triggerId = '476ce50d-ac6f-4553-8400-b7ae0aad70c2'

export const campaignTrigger = {
    id: triggerId,
    type: 'time_spent_on_page',
    operator: 'gt',
    value: 10,
}

export const campaign = {
    id: campaignId,
    name: 'Welcome to the internet',
    description: 'A campaign to welcome people to the internet',
    message_text: 'Hello, please enjoy your stay on the internet.',
    message_html: 'Hello, please enjoy your stay on the <b>internet</b>.',
    language: 'en-US',
    status: 'active',
    is_light: false,
    trigger_rule: `{${triggerId}}`,
    attachments: [],
    meta: {
        delay: null,
        noReply: null,
        agentName: null,
        agentAvatarUrl: null,
        agentEmail: null,
    },
    triggers: [campaignTrigger],
    variants: [],
    created_datetime: '2024-02-16T09:57:44.284000',
    updated_datetime: '2024-02-16T09:57:56.352370',
    deleted_datetime: null,
    template_id: null,
}
