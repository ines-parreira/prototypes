import { screen } from '@testing-library/react'

import { mockPhoneIntegration } from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { VoiceIntegrationSelectCaption } from '../VoiceIntegrationSelectCaption'

const mockIntegration = mockPhoneIntegration({
    id: 123,
    name: 'Test Integration',
})

const renderComponent = (props = {}) => {
    return renderWithStoreAndQueryClientAndRouter(
        <VoiceIntegrationSelectCaption {...props} />,
    )
}

describe('<VoiceIntegrationSelectCaption />', () => {
    describe('when no integration is provided', () => {
        it('should render the base text content', () => {
            renderComponent()

            const link = screen.getByRole('link', {
                name: /voice integrations/i,
            })

            expect(link).toHaveAttribute(
                'href',
                `${PHONE_INTEGRATION_BASE_URL}/integrations`,
            )
        })
    })

    describe('when integration is provided', () => {
        it('should render the link to the integration flow', () => {
            renderComponent({ integration: mockIntegration })

            const link = screen.getByRole('link', {
                name: /here/i,
            })

            expect(link).toHaveAttribute(
                'href',
                `${PHONE_INTEGRATION_BASE_URL}/${mockIntegration.id}/flow`,
            )
        })
    })
})
