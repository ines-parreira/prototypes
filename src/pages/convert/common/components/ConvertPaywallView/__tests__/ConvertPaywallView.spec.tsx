import React from 'react'

import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { RootState } from 'state/types'
import { getStateWithHelpdeskPlan } from 'utils/paywallTesting'
import { mockStore } from 'utils/testing'

import { ConvertFeatures } from '../constants'
import ConvertPaywallView from '../ConvertPaywallView'

describe('ConvertPaywallView', () => {
    const renderWithStore = (state: Partial<RootState>) =>
        render(
            <Provider store={mockStore(state as any)}>
                <ConvertPaywallView
                    convertFeature={ConvertFeatures.Default}
                    onSubscribedRedirectPath={
                        '/app/settings/convert/click-tracking'
                    }
                />
            </Provider>,
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

    it('always has custom CTA and modal', () => {
        const mockedState = getStateWithHelpdeskPlan()

        const { getByText } = renderWithStore(mockedState)

        expect(getByText('Book Demo')).toBeInTheDocument()
    })
})
