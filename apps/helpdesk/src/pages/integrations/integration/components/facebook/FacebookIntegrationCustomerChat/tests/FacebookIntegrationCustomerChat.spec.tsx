import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { FACEBOOK_INTEGRATION_TYPE } from 'constants/integration'

import FacebookIntegrationCustomerChat from '../FacebookIntegrationCustomerChat'

describe('<FacebookIntegrationCustomerChat />', () => {
    it('should show the warning banner if an integration already setup messenger on shopify', () => {
        render(
            <MemoryRouter>
                <FacebookIntegrationCustomerChat
                    integration={fromJS({
                        id: 2,
                        name: 'mychat',
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: {
                            shopify_integration_ids: [3],
                            script_url: 'config.gorgias.io/foo/chat/bar',
                        },
                    })}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText(/We are no longer supporting/))
    })
})
