import React from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {renderWithRouter} from 'utils/testing'
import {
    BILLING_BASE_PATH,
    BILLING_PAYMENTS_HISTORY,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {FeatureFlagKey} from 'config/featureFlags'
import BillingStartView from '../BillingStartView'

describe('BillingStartView', () => {
    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.NewBillingInterface]: true,
        })
    })

    it('should render a BillingStartView component and load the Usage & Plans view', () => {
        const {container} = renderWithRouter(<BillingStartView />, {
            route: BILLING_BASE_PATH,
        })

        expect(container.querySelector('li:last-child')).toHaveTextContent(
            'Usage & Plans'
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the Payments History Page', () => {
        const {container} = renderWithRouter(<BillingStartView />, {
            route: BILLING_PAYMENTS_HISTORY,
        })

        expect(container.querySelector('li:last-child')).toHaveTextContent(
            'Payment History'
        )
    })

    it('should render the Payment Information page', () => {
        const {container} = renderWithRouter(<BillingStartView />, {
            route: BILLING_PAYMENT_PATH,
        })

        expect(container.querySelector('li:last-child')).toHaveTextContent(
            'Payment Information'
        )
    })
})
