import {cleanup, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {mockStore} from 'utils/testing'
import {whatsAppMessageTemplates} from 'fixtures/whatsAppMessageTemplates'

import WhatsAppMessageTemplateMessage from '../whatsapp/WhatsAppMessageTemplateMessage'

describe('WhatsAppMessageTemplateMessage', () => {
    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplateMessage
                    template={whatsAppMessageTemplates[0]}
                />
            </Provider>
        )

    afterEach(cleanup)

    it('should render all variables as "WhatsApp Variable"', () => {
        renderComponent()
        expect(screen.getAllByText('WhatsApp Variable')).toHaveLength(2)
    })
})
