import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'

import {CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES} from '../../../../../../../config/integrations/index.ts'

import {
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
} from '../../../../../../../config/integrations/smooch_inside.ts'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../../../constants/integration.ts'
import {
    FRENCH_LANGUAGE,
    SPANISH_LANGUAGE,
} from '../../../../../../../constants/languages.ts'

import {ChatIntegrationMigration} from '../ChatIntegrationMigration.tsx'

const integration = fromJS({
    id: 1,
    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
    decoration: {
        avatar_type: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
        avatar_team_picture_url: null,
        conversation_color: '#0d87dd',
        introduction_text: 'How can we help from old integration?',
        main_color: '#EB144C',
        offline_introduction_text: "We'll be back with a new integration",
    },
    meta: {
        webhook: {
            callback_url:
                'https://incoming-philippe.ngrok.io/api/incoming/smooch/',
            id: '5fcfccc98a8661000c72e7c9',
            secret:
                'UEwegLe6sg5DbI5wDoLyvBXmxl3WsnZ9-rkq_xHsyZ2sysUqhN-rGk4UNNTJacvumVvCIcB3gMvpwTUPWmIakA',
        },
        app_id: '5fcfccc8707066000cdc86df',
        script_url:
            'https://config.gorgi.us/development/Zr1WE86rb6J4Mvgl/chat/W0eMnwxKL69bDNoB.js',
        app_token: '3q9qkn87fdwmyanjwabrpeknm',
        quick_replies: {
            enabled: true,
            replies: ['Get order status', 'Apply promo code', 'custom reply'],
        },
        preferences: {
            auto_responder: {
                enabled: true,
                reply: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
            },
            email_capture_enforcement: SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        },
        language: SPANISH_LANGUAGE,
        campaigns: [
            {
                id: '9a035393-4a2f-44f9-b202-f6e06a08100f',
                deactivated_datetime: '2020-12-08T18:58:17.674204',
                message: {
                    html:
                        '<div>Hi there, this is an old integration campaign</div>',
                    text: 'Hi there, this is an old integration campaign',
                },
                triggers: [
                    {
                        operator: 'contains',
                        value: '/',
                        key: 'current_url',
                    },
                ],
                name: 'Welcome visitors from old integration',
            },
        ],
    },
    name: 'hellosmoochintegration',
    uri: '/api/integrations/19/',
})

describe('ChatIntegrationMigration component', () => {
    it('should display the migration page', () => {
        const actions = {
            updateOrCreateIntegration: jest.fn(),
        }

        const {container} = render(
            <ChatIntegrationMigration
                actions={actions}
                integration={integration}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should create a new gorgias_chat integration when clicking on the migration button', () => {
        const updateOrCreateIntegration = jest.fn()

        const {container} = render(
            <ChatIntegrationMigration
                updateOrCreateIntegration={updateOrCreateIntegration}
                integration={integration}
            />
        )
        const btn = container.querySelector('button.btn-success')
        userEvent.click(btn)

        const parameters = updateOrCreateIntegration.mock.calls[0][0]
        expect(parameters).not.toHaveProperty('meta.webhook')
        expect(parameters).not.toHaveProperty('meta.script_url')
        expect(parameters).not.toHaveProperty('meta.need_scope_update')
        expect(parameters).not.toHaveProperty('meta.app_token')
        expect(parameters).not.toHaveProperty('meta.app_id')
        expect(parameters).not.toHaveProperty('meta.shopify_integration_ids')
        expect(parameters).not.toHaveProperty('uri')
        expect(parameters).not.toHaveProperty('description')
        expect(parameters).not.toHaveProperty('updated_datetime')
        // field that will trigger the creation of a new integration
        expect(parameters).not.toHaveProperty('id')
        expect(parameters).not.toHaveProperty('created_datetime')
        // report the old integration settings
        expect(parameters.get('type')).toEqual('gorgias_chat')
        expect(parameters.get('name')).toEqual(integration.get('name'))
        expect(parameters.get('decoration')).toEqual(
            integration.get('decoration')
        )
        expect(parameters.getIn(['meta', 'quick_replies'])).toEqual(
            integration.getIn(['meta', 'quick_replies'])
        )
        expect(parameters.getIn(['meta', 'preferences'])).toEqual(
            integration.getIn(['meta', 'preferences'])
        )
        expect(parameters.getIn(['meta', 'campaigns'])).toEqual(
            integration.getIn(['meta', 'campaigns'])
        )
        expect(parameters.getIn(['meta', 'language'])).toEqual(
            integration.getIn(['meta', 'language'])
        )
    })

    it('should create a new gorgias_chat integration with the default french locale', () => {
        const updateOrCreateIntegration = jest.fn()

        const frenchIntegration = integration.setIn(
            ['meta', 'language'],
            FRENCH_LANGUAGE
        )

        const {container} = render(
            <ChatIntegrationMigration
                updateOrCreateIntegration={updateOrCreateIntegration}
                integration={frenchIntegration}
            />
        )
        const btn = container.querySelector('button.btn-success')
        userEvent.click(btn)

        const parameters = updateOrCreateIntegration.mock.calls[0][0]
        expect(parameters.getIn(['meta', 'language'])).toEqual('fr-FR')
    })
})
