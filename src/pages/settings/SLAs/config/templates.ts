import {SLAPolicyTargetChannelsItem} from '@gorgias/api-queries'
import {MappedFormSLAPolicy} from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'

export type SLATemplate = Omit<MappedFormSLAPolicy, 'uuid'> & {
    description: string
    icon: string
}

export const TEMPLATES_LIST: SLATemplate[] = [
    {
        name: 'Chat',
        description:
            'Provide customers with best-in-class chat support by using the suggested SLA settings for chat.',
        target_channels: [SLAPolicyTargetChannelsItem.Chat],
        metrics: {
            FRT: {
                threshold: 1,
                unit: 'minute',
            },
            RT: {
                threshold: 35,
                unit: 'minute',
            },
        },
        icon: 'forum',
        active: true,
    },
    {
        name: 'Email',
        description:
            'Provide customers with best-in-class email support by using the suggested SLA settings for email.',
        target_channels: [SLAPolicyTargetChannelsItem.Email],
        metrics: {
            FRT: {
                threshold: 25,
                unit: 'minute',
            },
            RT: {
                threshold: 6,
                unit: 'hour',
            },
        },
        icon: 'forum',
        active: true,
    },
    {
        name: 'Social media',
        description:
            'Provide customers with best-in-class social channel support by using the suggested SLA settings for social channels.',
        target_channels: [
            SLAPolicyTargetChannelsItem.Facebook,
            SLAPolicyTargetChannelsItem.FacebookMention,
            SLAPolicyTargetChannelsItem.FacebookMessenger,
            SLAPolicyTargetChannelsItem.FacebookRecommendations,
            SLAPolicyTargetChannelsItem.InstagramAdComment,
            SLAPolicyTargetChannelsItem.InstagramComment,
            SLAPolicyTargetChannelsItem.InstagramDirectMessage,
            SLAPolicyTargetChannelsItem.InstagramMention,
            SLAPolicyTargetChannelsItem.TiktokShop,
            SLAPolicyTargetChannelsItem.Twitter,
            SLAPolicyTargetChannelsItem.TwitterDirectMessage,
        ],
        metrics: {
            FRT: {
                threshold: 5,
                unit: 'minute',
            },
            RT: {
                threshold: 45,
                unit: 'minute',
            },
        },
        icon: 'group',
        active: true,
    },
]
