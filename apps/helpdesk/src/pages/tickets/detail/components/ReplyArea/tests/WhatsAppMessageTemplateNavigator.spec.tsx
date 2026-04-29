import { render, userEvent } from '@repo/testing'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'

import { whatsAppMessageTemplates as mockWhatsAppMessageTemplates } from 'fixtures/whatsAppMessageTemplates'
import { useListWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/queries'

import WhatsAppMessageTemplateNavigator from '../WhatsAppMessageTemplateNavigator'

jest.mock('models/whatsAppMessageTemplates/queries', () => ({
    useListWhatsAppMessageTemplates: jest.fn(() => ({
        data: {
            data: mockWhatsAppMessageTemplates,
        },
    })),
}))
const listWhatsAppMessageTemplatesMock =
    useListWhatsAppMessageTemplates as jest.Mock

const mockSelectNewTemplate = jest.fn()

jest.mock(
    'pages/integrations/integration/components/whatsapp/useWhatsAppEditor',
    () =>
        jest.fn(() => ({
            searchFilter: {
                language: [],
                name: '',
            },
            selectNewTemplate: mockSelectNewTemplate,
        })),
)

describe('WhatsAppMessageTemplateNavigator', () => {
    const renderComponent = () => render(<WhatsAppMessageTemplateNavigator />)

    afterEach(cleanup)

    it('should display the preview of the first template by default', () => {
        renderComponent()
        expect(
            screen.getByText('one-time password', { exact: false }),
        ).toBeVisible()
    })

    it('should display the preview of the hovered template', async () => {
        renderComponent()
        userEvent.hover(screen.getByText('rejected_template_sample'))

        await waitFor(() => {
            expect(
                screen.getByText('rejected template content', { exact: false }),
            ).toBeVisible()
        })
    })

    it('should trigger onClick when clicking on a template', () => {
        renderComponent()
        fireEvent.click(screen.getByText('rejected_template_sample'))
        expect(mockSelectNewTemplate).toHaveBeenCalledWith(
            mockWhatsAppMessageTemplates[1],
        )
    })
    it('should display message when there are no templates', () => {
        listWhatsAppMessageTemplatesMock.mockReturnValue([])
        render(<WhatsAppMessageTemplateNavigator />)
        expect(
            screen.getByTestId('missing-templates-instructions'),
        ).toBeInTheDocument()
    })
})
