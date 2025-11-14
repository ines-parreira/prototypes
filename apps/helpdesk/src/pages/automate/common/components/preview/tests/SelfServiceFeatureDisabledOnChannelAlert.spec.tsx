import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import SelfServiceFeatureDisabledOnChannelAlert from '../SelfServiceFeatureDisabledOnChannelAlert'

jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)

describe('<SelfServiceFeatureDisabledOnChannelAlert />', () => {
    it('should render component', () => {
        useIsAutomateSettingsMock.mockReturnValue(false)
        render(
            <MemoryRouter>
                <SelfServiceFeatureDisabledOnChannelAlert
                    shopName="shop-name"
                    shopType="shop-type"
                />
            </MemoryRouter>,
        )
        expect(
            screen.getByText(/this feature is currently disabled/i),
        ).toBeInTheDocument()
    })
    it('should render in automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)
        render(
            <MemoryRouter>
                <SelfServiceFeatureDisabledOnChannelAlert
                    shopName="shop-name"
                    shopType="shop-type"
                />
            </MemoryRouter>,
        )
        expect(
            screen.getByText(/this feature is currently disabled/i),
        ).toBeInTheDocument()
    })
})
