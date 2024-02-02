import {
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from '../models/integration/types'

export const chatIntegrationFixtures: GorgiasChatIntegration[] = [
    {
        deleted_datetime: null,
        meta: {
            shop_type: 'shopify',
            shop_integration_id: 8,
            shop_name: 'ulads-store',
            shopify_integration_ids: [],
            preferences: {
                email_capture_enforcement: GorgiasChatEmailCaptureType.Optional,
                auto_responder: {
                    enabled: true,
                    reply: 'reply-dynamic',
                },
                privacy_policy_disclaimer_enabled: false,
            },
            language: 'en-US',
            app_id: '36',
            self_service: {
                enabled: false,
            },
        },
        deactivated_datetime: null,
        name: 'New chat',
        uri: '/api/integrations/10/',
        decoration: {
            avatar_team_picture_url: '',
            position: {
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                offsetX: 1,
                offsetY: 1,
            },
            main_font_family: '',
            avatar_type: 'team-members',
            conversation_color: '#0d87dd',
            introduction_text: 'How can we help?',
            offline_introduction_text: "We'll be back tomorrow",
            main_color: '#0d87dd',
        },
        locked_datetime: null,
        created_datetime: '2023-07-21T09:21:50.663360+00:00',
        type: IntegrationType.GorgiasChat,
        id: 10,
        description: null,
        updated_datetime: '2023-10-19T14:17:47.887330+00:00',
        user: {id: 1},
    },
]
