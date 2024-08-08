import {campaign} from './campaign'

export const campaignId = 'ee869594-65e2-45a5-a759-a4660c9ce677'

export const abGroup = {
    campaign_id: campaignId,
    started_datetime: null,
    status: 'draft',
    stopped_datetime: null,
    winner_variant_id: null,
}

export const variants = [
    {
        id: 'ee269594-25e2-45a25-a759-a4660c9ce677',
        message_text: 'Lorem Ipsum',
        message_html: 'Lorem <b>Ipsum</b>.',
    },
    {
        id: 'ee269594-25e2-45a25-a759-a4660c9ce622',
        message_text: 'Lorem Ipsum dolor',
        message_html: 'Lorem <b>Ipsum dolor</b>.',
    },
]

export const campaignWithABGroup = {
    ...campaign,
    ab_group: abGroup,
    variants: variants,
}
