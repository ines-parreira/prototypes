import React from 'react'

import { render, screen } from '@testing-library/react'

import SelfServiceFeatureDisabledOnChannelAlert from '../SelfServiceFeatureDisabledOnChannelAlert'

describe('<SelfServiceFeatureDisabledOnChannelAlert />', () => {
    it('should render component', () => {
        render(
            <SelfServiceFeatureDisabledOnChannelAlert
                shopName="shop-name"
                shopType="shop-type"
            />,
        )
        expect(
            screen.getByText(/this feature is currently disabled/i),
        ).toBeInTheDocument()
    })
})
