import { TicketChannel } from 'business/types/ticket'
import { Language } from 'constants/languages'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatEmailCaptureType,
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from 'models/integration/types'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export const mockChatChannels: SelfServiceChatChannel[] = [
    {
        type: TicketChannel.Chat,
        value: {
            user: { id: 1 },
            deleted_datetime: null,
            meta: {
                self_service: {},
                shop_type: 'shopify',
                wizard: {
                    installation_method:
                        GorgiasChatCreationWizardInstallationMethod.Manual,
                    status: GorgiasChatCreationWizardStatus.Published,
                    step: GorgiasChatCreationWizardSteps.Installation,
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement:
                        GorgiasChatEmailCaptureType.Optional,
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                },
                language: 'en-US',
                app_id: '25',
                languages: [
                    {
                        language: Language.EnglishUs,
                        primary: true,
                    },
                ],
            },

            deactivated_datetime: null,
            name: '25 Shopify Chat',
            uri: '/api/integrations/15/',
            decoration: {
                avatar_team_picture_url: 'mock_url',
                main_font_family: 'mock_font',
                avatar_type: 'team-members',
                launcher: {
                    type: GorgiasChatLauncherType.ICON,
                    label: '',
                },
                background_color_style:
                    GorgiasChatBackgroundColorStyle.Gradient,
                conversation_color: '#115cb5',
                position: {
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                    name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:45:34.203519+00:00',
            type: IntegrationType.GorgiasChat,
            id: 15,
            description: null,
            updated_datetime: '2024-07-12T12:44:21.004402+00:00',
            managed: false,
        },
    },
    {
        type: TicketChannel.Chat,
        value: {
            user: { id: 1 },
            deleted_datetime: null,
            meta: {
                self_service: {},
                shop_type: 'shopify',
                wizard: {
                    installation_method:
                        GorgiasChatCreationWizardInstallationMethod.Manual,
                    status: GorgiasChatCreationWizardStatus.Published,
                    step: GorgiasChatCreationWizardSteps.Installation,
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement:
                        GorgiasChatEmailCaptureType.Optional,
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                },
                language: 'en-US',
                app_id: '24',
                languages: [
                    {
                        language: Language.EnglishUs,
                        primary: true,
                    },
                ],
            },
            deactivated_datetime: null,
            name: '26 Shopify Chat',
            uri: '/api/integrations/1145/',
            decoration: {
                avatar_team_picture_url: 'mock_url',
                main_font_family: 'mock_font',
                avatar_type: 'team-members',
                launcher: {
                    type: GorgiasChatLauncherType.ICON,
                    label: '',
                },
                background_color_style:
                    GorgiasChatBackgroundColorStyle.Gradient,
                conversation_color: '#115cb5',
                position: {
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                    name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:45:34.203519+00:00',
            type: IntegrationType.GorgiasChat,
            id: 14,
            description: null,
            updated_datetime: '2024-07-12T12:44:21.004402+00:00',
            managed: false,
        },
    },
    {
        type: TicketChannel.Chat,
        value: {
            user: { id: 1 },
            deleted_datetime: null,
            meta: {
                self_service: {},
                shop_type: 'shopify',
                wizard: {
                    installation_method:
                        GorgiasChatCreationWizardInstallationMethod.Manual,
                    status: GorgiasChatCreationWizardStatus.Published,
                    step: GorgiasChatCreationWizardSteps.Installation,
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement:
                        GorgiasChatEmailCaptureType.Optional,
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                },
                language: 'en-US',
                app_id: '23',
                languages: [
                    {
                        language: Language.EnglishUs,
                        primary: true,
                    },
                ],
            },
            deactivated_datetime: null,
            name: 'test 1',
            uri: '/api/integrations/13/',
            decoration: {
                avatar_team_picture_url: 'mock_url',
                main_font_family: 'mock_font',
                avatar_type: 'team-members',
                launcher: {
                    type: GorgiasChatLauncherType.ICON,
                    label: '',
                },
                background_color_style:
                    GorgiasChatBackgroundColorStyle.Gradient,
                conversation_color: '#115cb5',
                position: {
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                    name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:45:34.203519+00:00',
            type: IntegrationType.GorgiasChat,
            id: 16,
            description: null,
            updated_datetime: '2024-07-12T12:44:21.004402+00:00',
            managed: false,
        },
    },
    {
        type: TicketChannel.Chat,
        value: {
            user: { id: 1 },
            deleted_datetime: null,
            meta: {
                self_service: {},
                shop_type: 'shopify',
                wizard: {
                    installation_method:
                        GorgiasChatCreationWizardInstallationMethod.Manual,
                    status: GorgiasChatCreationWizardStatus.Published,
                    step: GorgiasChatCreationWizardSteps.Installation,
                },
                shop_integration_id: 8,
                shop_name: 'itay-store-two',
                shopify_integration_ids: [],
                preferences: {
                    email_capture_enforcement:
                        GorgiasChatEmailCaptureType.Optional,
                    auto_responder: {
                        enabled: true,
                        reply: 'reply-dynamic',
                    },
                    privacy_policy_disclaimer_enabled: false,
                },
                language: 'en-US',
                app_id: '20',
                languages: [
                    {
                        language: Language.EnglishUs,
                        primary: true,
                    },
                ],
            },
            deactivated_datetime: null,
            name: "Itay's Chat",
            uri: '/api/integrations/10/',
            decoration: {
                avatar_team_picture_url: 'mock_url',
                main_font_family: 'mock_font',
                avatar_type: 'team-members',
                launcher: {
                    type: GorgiasChatLauncherType.ICON,
                    label: '',
                },
                background_color_style:
                    GorgiasChatBackgroundColorStyle.Gradient,
                conversation_color: '#115cb5',
                position: {
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                    offsetX: 0,
                    offsetY: 0,
                },
                introduction_text: 'How can we help?',
                offline_introduction_text: 'We will be back soon',
                avatar: {
                    image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                    name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                },
                main_color: '#115cb5',
            },
            locked_datetime: null,
            created_datetime: '2024-06-17T10:45:34.203519+00:00',
            type: IntegrationType.GorgiasChat,
            id: 10,
            description: null,
            updated_datetime: '2024-07-12T12:44:21.004402+00:00',
            managed: false,
        },
    },
]
