import {fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationActionButtons} from 'pages/integrations/integration/components/magento2/IntegrationActionButtons'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'
import {deleteIntegration} from 'state/integrations/actions'
import {assumeMock, renderWithStore} from 'utils/testing'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('state/integrations/actions')
const mockedDeleteIntegration = assumeMock(deleteIntegration)

describe('IntegrationActionButtons', () => {
    const integrations = fromJS([
        {
            meta: {
                store_url: 'https://myshop.com',
            },
        },
    ])

    beforeEach(() => {
        mockedDeleteIntegration.mockReturnValue({} as any)

        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
    })
    it('renders update connection button when isUpdate is true', () => {
        const {getByRole} = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integrations}
                redirectUri=""
            />,
            {}
        )

        expect(
            getByRole('button', {name: /Update connection/i})
        ).toBeInTheDocument()
    })

    it('renders connect app button when isUpdate is false', () => {
        const {getByText} = renderWithStore(
            <IntegrationActionButtons
                isUpdate={false}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integrations}
                redirectUri=""
            />,
            {}
        )

        expect(getByText(/Connect app/i)).toBeInTheDocument()
    })

    it('calls deleteIntegration when delete button is clicked', () => {
        const {getByRole} = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integrations}
                redirectUri=""
            />,
            {}
        )

        fireEvent.click(getByRole('button', {name: /Delete App/i}))
        fireEvent.click(getByRole('button', {name: /Confirm/i}))

        expect(mockedDispatch).toHaveBeenCalledWith({})
        expect(mockedDeleteIntegration).toHaveBeenCalledTimes(1)
    })

    it('renders confirmation message when delete button is clicked and message should not contain text about "saved filters"', () => {
        const {getByRole, getByText, queryByText} = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integrations}
                redirectUri=""
            />,
            {}
        )

        fireEvent.click(getByRole('button', {name: /Delete App/i}))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
        ).toBeInTheDocument()
        expect(
            queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
        ).not.toBeInTheDocument()
    })

    it('renders confirmation message when delete button is clicked and message should contain text about "saved filters"', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: true,
        })

        const {getByRole, getByText} = renderWithStore(
            <IntegrationActionButtons
                isUpdate={true}
                isSubmitting={false}
                submitIsDisabled={false}
                integration={integrations}
                redirectUri=""
            />,
            {}
        )

        fireEvent.click(getByRole('button', {name: /Delete App/i}))

        expect(
            getByText(
                `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
            )
        ).toBeInTheDocument()
    })
})
