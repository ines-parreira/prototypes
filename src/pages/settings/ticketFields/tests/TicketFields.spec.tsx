import React from 'react'
import {render} from '@testing-library/react'

import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import TicketFields from '../TicketFields'

describe('<TicketFields/>', () => {
    it('should not render if the account does not have the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({}))

        const {container} = render(<TicketFields />)
        expect(container.firstChild).toBeNull()
    })

    it('should render if the account has the feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.TicketFields]: true,
        }))

        const {container} = render(<TicketFields />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
