import {cleanup, fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import userEvent from '@testing-library/user-event'
import {mockStore} from 'utils/testing'
import {whatsAppMessageTemplates as mockWhatsAppMessageTemplates} from 'fixtures/whatsAppMessageTemplates'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import WhatsAppMessageTemplateNavigator from '../WhatsAppMessageTemplateNavigator'

jest.mock('models/whatsAppMessageTemplates/queries', () => ({
    useListWhatsAppMessageTemplates: jest.fn(() => ({
        data: {
            data: mockWhatsAppMessageTemplates,
        },
    })),
}))

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
        }))
)

describe('WhatsAppMessageTemplateNavigator', () => {
    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplateNavigator />
            </Provider>
        )

    afterEach(cleanup)

    it('should display the preview of the first template by default', () => {
        renderComponent()
        expect(
            screen.getByText('one-time password', {exact: false})
        ).toBeVisible()
    })

    it('should display the preview of the hovered template', () => {
        renderComponent()
        userEvent.hover(screen.getByText('rejected_template_sample'))
        expect(
            screen.getByText('rejected template content', {exact: false})
        ).toBeVisible()
    })

    it('should trigger onClick when clicking on a template', () => {
        renderComponent()
        fireEvent.click(screen.getByText('rejected_template_sample'))
        expect(mockSelectNewTemplate).toHaveBeenCalledWith(
            mockWhatsAppMessageTemplates[1]
        )
    })
})
