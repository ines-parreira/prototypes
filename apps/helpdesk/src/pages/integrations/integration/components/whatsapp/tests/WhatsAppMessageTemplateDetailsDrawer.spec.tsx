import React from 'react'

import { render } from '@repo/testing'
import { cleanup, screen } from '@testing-library/react'

import { whatsAppMessageTemplates } from 'fixtures/whatsAppMessageTemplates'

import { WhatsAppMessageTemplateDetailsDrawer } from '../WhatsAppMessageTemplateDetailsDrawer'

describe('WhatsAppMessageTemplateDetailsDrawer', () => {
    const renderComponent = () =>
        render(
            <WhatsAppMessageTemplateDetailsDrawer
                template={whatsAppMessageTemplates[0]}
                setIsOpen={jest.fn()}
                isOpen
            />,
        )

    afterEach(cleanup)

    it('should render template with title, details and message', () => {
        renderComponent()

        // title
        expect(screen.getByText('sample_purchase_feedback')).toBeTruthy()
        // status
        expect(screen.getByText('Active')).toBeTruthy()
        // category
        expect(screen.getByText('Marketing')).toBeTruthy()
        // language
        expect(screen.getByText('English')).toBeTruthy()

        // message
        expect(screen.getByTestId('template-message')).toBeTruthy()
    })
})
