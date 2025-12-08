import React from 'react'

import { cleanup, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { whatsAppMessageTemplates } from 'fixtures/whatsAppMessageTemplates'
import { useListWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/queries'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import WhatsAppMessageTemplatesList from '../WhatsAppMessageTemplatesList'

jest.mock('models/whatsAppMessageTemplates/queries', () => ({
    useListWhatsAppMessageTemplates: jest.fn(),
}))

const useListWhatsAppMessageTemplatesMock =
    useListWhatsAppMessageTemplates as jest.Mock

describe('WhatsAppMessageTemplatesList', () => {
    const mockPhoneNumberId = 123

    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplatesList
                    phoneNumberId={mockPhoneNumberId}
                />
            </Provider>,
        )

    beforeEach(() => {
        useListWhatsAppMessageTemplatesMock.mockReturnValue({
            data: {
                data: whatsAppMessageTemplates,
            },
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        cleanup()
        jest.clearAllMocks()
    })

    it('should render introduction text', () => {
        renderComponent()

        expect(
            screen.getByText(
                /Use a message template to start a conversation with a new customer/,
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /Only templates with an "Active" status from WhatsApp can be sent to customers/,
            ),
        ).toBeInTheDocument()
    })

    it('should render the documentation link', () => {
        renderComponent()

        const link = screen.getByText('How To Use WhatsApp Message Templates')

        expect(link).toBeInTheDocument()
        expect(link.closest('a')).toHaveAttribute(
            'href',
            'https://link.gorgias.com/5ba90d',
        )
        expect(link.closest('a')).toHaveAttribute('target', '_blank')
        expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render table headers', () => {
        renderComponent()

        expect(screen.getByText('Template name')).toBeInTheDocument()
        expect(screen.getByText('Category')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('should render template rows', () => {
        renderComponent()

        expect(screen.getByText('sample_purchase_feedback')).toBeInTheDocument()
        expect(screen.getByText('rejected_template_sample')).toBeInTheDocument()
    })

    it('should render template categories', () => {
        renderComponent()

        expect(screen.getByText('Marketing')).toBeInTheDocument()
        expect(screen.getByText('Utility')).toBeInTheDocument()
    })

    it('should render template statuses', () => {
        renderComponent()

        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Rejected')).toBeInTheDocument()
    })
})
