import React from 'react'

import { render, screen } from '@testing-library/react'

import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import { assumeMock } from 'utils/testing'

import SelfServiceFeatureDisabledOnChannelAlert from '../SelfServiceFeatureDisabledOnChannelAlert'

jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)

describe('<SelfServiceFeatureDisabledOnChannelAlert />', () => {
    it('should render component', () => {
        useIsAutomateSettingsMock.mockReturnValue(false)
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
    it('should render in automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)
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
