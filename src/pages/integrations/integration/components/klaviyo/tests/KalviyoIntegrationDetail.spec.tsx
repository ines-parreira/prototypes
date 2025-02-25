import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { SUCCESS_AUTHENTICATION_STATUS } from 'constants/integration'
import KlaviyoIntegrationDetail from 'pages/integrations/integration/components/klaviyo/KlaviyoIntegrationDetail'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

describe('KlaviyoIntegrationDetail', () => {
    const actions = {
        fetchIntegration: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
        klaviyoSyncHistoricalEvent: jest.fn(),
    }
    const defaultProps: ComponentProps<typeof KlaviyoIntegrationDetail> = {
        actions,
        integration: fromJS({}),
        loading: fromJS({}),
        isUpdate: fromJS({}),
    }

    it('should check the warning message of removing the integration, it should contain the text related to saved filters', () => {
        const { getByRole, getByText } = render(
            <KlaviyoIntegrationDetail
                {...{
                    ...defaultProps,
                }}
                integration={fromJS({
                    id: 1,
                    meta: {
                        oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                        sync_state: { is_initialized: false },
                    },
                })}
            />,
        )

        fireEvent.click(getByRole('button', { name: /Delete App/i }))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
        ).toBeInTheDocument()
    })
})
