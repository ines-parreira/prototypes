import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {mockStore} from 'utils/testing'
import {WhatsAppTemplate} from 'models/integration/types'
import WhatsAppTemplateMessage from '../whatsapp/WhatsAppTemplateMessage'

const mockTemplate = {
    components: {
        header: {
            type: 'text',
            value: 'LOGIN ATTEMPT',
        },
        body: {
            type: 'text',
            value: "Hey {{1}},\\nHere's your one-time password:  *{{2}}*\\nCode expires in 30 minutes.",
        },
        footer: {
            type: 'text',
            value: 'If you never requested this code, please ignore the message.',
        },
        button: {
            type: 'url',
            value: 'https://app.mobile.me.app/{{1}}',
        },
    },
    category: 'MARKETING',
    id: '100500',
    external_id: '1184662202111735',
    language: 'en_US',
    name: 'sample_purchase_feedback',
    status: 'REJECTED',
    rejected_reason: 'INVALID_FORMAT',
    quality_score: 'UNKNOWN',
    waba_id: '123128413183132',
    created_datetime: 'datetime',
    updated_datetime: 'datetime',
    deactivated_datetime: 'datetime',
} as WhatsAppTemplate

describe('WhatsAppTemplateMessage', () => {
    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <WhatsAppTemplateMessage template={mockTemplate} />
            </Provider>
        )

    afterEach(cleanup)

    it('should render all variables as "WhatsApp Variable"', () => {
        renderComponent()
        expect(screen.getAllByText('WhatsApp Variable')).toHaveLength(2)
    })
})
