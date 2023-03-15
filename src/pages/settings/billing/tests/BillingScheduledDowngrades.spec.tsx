import {render} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {ProductType} from 'models/billing/types'

import useScheduledDowngrades from '../hooks/useScheduledDowngrades'
import BillingScheduledDowngrades from '../BillingScheduledDowngrades'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('../hooks/useScheduledDowngrades')

const mockUseFlags = useFlags as jest.Mock
const mockUseScheduledDowngrades = useScheduledDowngrades as jest.Mock

describe('BillingScheduledDowngrades', () => {
    const price1 = {name: 'Price 1', price_id: 'price1'}
    const price2 = {name: 'Price 2', price_id: 'price2'}

    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.BillingEndOfCycleDowngradeMessaging]: true,
        })

        mockUseScheduledDowngrades.mockReturnValue({loading: true})
    })

    it('should return null if the feature flag is disabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.BillingEndOfCycleDowngradeMessaging]: false,
        })

        const {container} = render(<BillingScheduledDowngrades />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should return null if the scheduled downgrades are still loading', () => {
        const {container} = render(<BillingScheduledDowngrades />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render an error if the scheduled downgrades failed to load', () => {
        const error = new Error('Oh no!')
        mockUseScheduledDowngrades.mockReturnValue({error, loading: false})

        const {getByText} = render(<BillingScheduledDowngrades />)
        expect(
            getByText(
                'Something went wrong while trying to fetch scheduled downgrades.'
            )
        ).toBeInTheDocument()
    })

    it('should return null if there are no scheduled downgrades', () => {
        mockUseScheduledDowngrades.mockReturnValue({loading: false, value: []})

        const {container} = render(<BillingScheduledDowngrades />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render a downgrade message for plans being downgraded that will still be in effect after the downgrade', () => {
        mockUseScheduledDowngrades.mockReturnValue({
            loading: false,
            value: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    from: price1,
                    product: {id: 'helpdesk', type: ProductType.Helpdesk},
                    to: price2,
                },
            ],
        })

        const {getByText} = render(<BillingScheduledDowngrades />)
        const msg =
            'Your plan change from Helpdesk Price 1 to Price 2 will take effect at the end of your billing cycle, on March 31st 2023.'
        expect(getByText(msg)).toBeInTheDocument()
    })

    it('should render a downgrade message for plans that will no longer have a plan after the downgrade', () => {
        mockUseScheduledDowngrades.mockReturnValue({
            loading: false,
            value: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    from: price1,
                    product: {id: 'helpdesk', type: ProductType.Helpdesk},
                },
            ],
        })

        const {getByText} = render(<BillingScheduledDowngrades />)
        const msg =
            'Your subscription to Helpdesk Price 1 will end at the end of your billing cycle on March 31st 2023.'
        expect(getByText(msg)).toBeInTheDocument()
    })
})
