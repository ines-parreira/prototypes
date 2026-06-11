import React from 'react'

import { render } from '@repo/testing'

import type { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'

import { ConvertFeatures } from '../constants'
import { ConvertPaywallView } from '../ConvertPaywallView'

describe('ConvertPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <ConvertPaywallView
                convertFeature={ConvertFeatures.Default}
                onSubscribedRedirectPath="/app/settings/convert/click-tracking"
            />,
            { storeState: state },
        )

    it('renders correctly', () => {
        const mockedState = getStateWithHelpdeskPlan()

        const { getByText } = renderWithStore(mockedState)

        expect(
            getByText(
                'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
            ),
        ).toBeInTheDocument()
        expect(
            getByText('Transform visitors into loyal customers.'),
        ).toBeInTheDocument()
    })
})
