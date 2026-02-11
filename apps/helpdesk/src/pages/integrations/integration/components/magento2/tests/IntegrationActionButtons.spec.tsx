import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationActionButtons } from 'pages/integrations/integration/components/magento2/IntegrationActionButtons'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import { deleteIntegration } from 'state/integrations/actions'
import { renderWithStore } from 'utils/testing'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('state/integrations/actions')
const mockedDeleteIntegration = assumeMock(deleteIntegration)

describe('IntegrationActionButtons', () => {
    const integration = fromJS({
        meta: {
            store_url: 'https://myshop.com',
            admin_url_suffix: '/admin',
        },
    })

    beforeEach(() => {
        mockedDeleteIntegration.mockReturnValue({} as any)
    })

    it('renders update connection button when isUpdate is true', () => {
        const { getByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        expect(
            getByRole('button', { name: /Update connection/i }),
        ).toBeInTheDocument()
    })

    it('renders connect app button when isUpdate is false', () => {
        const { getByText } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={false}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        expect(getByText(/Connect app/i)).toBeInTheDocument()
    })

    it('does not render delete button when isUpdate is false', () => {
        const { queryByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={false}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        expect(
            queryByRole('button', { name: /Delete App/i }),
        ).not.toBeInTheDocument()
    })

    it('calls deleteIntegration when delete button is clicked', () => {
        const { getByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        fireEvent.click(getByRole('button', { name: /Delete App/i }))
        fireEvent.click(getByRole('button', { name: /Confirm/i }))

        expect(mockedDispatch).toHaveBeenCalledWith({})
        expect(mockedDeleteIntegration).toHaveBeenCalledTimes(1)
    })

    it('renders confirmation message when delete button is clicked and message should contain text about "saved filters"', () => {
        const { getByRole, getByText } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        fireEvent.click(getByRole('button', { name: /Delete App/i }))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
        ).toBeInTheDocument()
    })

    it('renders manual reconnect button when integration is deactivated and manual', () => {
        const deactivatedManualIntegration = fromJS({
            deactivated_datetime: '2026-01-01T00:00:00Z',
            meta: {
                store_url: 'https://myshop.com',
                admin_url_suffix: '/admin',
                is_manual: true,
            },
        })

        const { getAllByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={deactivatedManualIntegration}
                redirectUri=""
            />,
            {},
        )

        const buttons = getAllByRole('button', { name: /Reconnect/i })
        expect(buttons).toHaveLength(1)
        expect(buttons[0]).toHaveAttribute('type', 'submit')
    })

    it('renders reconnect confirm button when integration is deactivated and not manual', () => {
        const deactivatedIntegration = fromJS({
            deactivated_datetime: '2026-01-01T00:00:00Z',
            meta: {
                store_url: 'https://myshop.com',
                admin_url_suffix: '/admin',
                is_manual: false,
            },
        })

        const { getByRole, getByText } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={deactivatedIntegration}
                redirectUri="https://redirect.example.com"
            />,
            {},
        )

        fireEvent.click(getByRole('button', { name: /Reconnect/i }))

        expect(
            getByText(
                /You first need to delete the integration on your Magento2 store/i,
            ),
        ).toBeInTheDocument()
    })

    it('redirects to correct URL when non-manual reconnect is confirmed', () => {
        const deactivatedIntegration = fromJS({
            deactivated_datetime: '2026-01-01T00:00:00Z',
            meta: {
                store_url: 'https://myshop.com',
                admin_url_suffix: '/admin',
                is_manual: false,
            },
        })

        const originalLocation = window.location.href

        const { getByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={deactivatedIntegration}
                redirectUri="https://redirect.example.com"
            />,
            {},
        )

        fireEvent.click(getByRole('button', { name: /Reconnect/i }))
        fireEvent.click(getByRole('button', { name: /Confirm/i }))

        expect(window.location.href).toBe(
            'https://redirect.example.com?store_url=https://myshop.com&admin_url_suffix=/admin',
        )

        window.location.href = originalLocation
    })

    it('does not render reconnect button when integration is not deactivated', () => {
        const { queryByRole } = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integration}
                redirectUri=""
            />,
            {},
        )

        expect(
            queryByRole('button', { name: /Reconnect/i }),
        ).not.toBeInTheDocument()
    })
})
