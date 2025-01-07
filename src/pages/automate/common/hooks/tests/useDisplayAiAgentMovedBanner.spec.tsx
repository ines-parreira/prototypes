import {renderHook} from '@testing-library/react-hooks'

import {createBrowserHistory} from 'history'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ReactNode} from 'react'
import {act} from 'react-dom/test-utils'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'

import AlertBanners, {BannersContextProvider} from 'AlertBanners'
import {FeatureFlagKey} from 'config/featureFlags'
import {mockStore} from 'utils/testing'

import {useDisplayAiAgentMovedBanner} from '../useDisplayAiAgentMovedBanner'

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

const mockHistory = createBrowserHistory()

describe('useDisplayAiAgentMovedBanner', () => {
    it('should display ai-agent-moved info banner when accessing Automate pages', () => {
        mockFlags({[FeatureFlagKey.ConvAiStandaloneMenu]: true})

        const wrapper = ({children}: {children: ReactNode}) => (
            <Router history={mockHistory}>
                <Provider store={mockStore({notifications: []})}>
                    <BannersContextProvider>
                        <AlertBanners />
                        {children}
                    </BannersContextProvider>
                </Provider>
            </Router>
        )

        renderHook(() => useDisplayAiAgentMovedBanner(), {wrapper})

        act(() => mockHistory.push('/app/automation'))
        expect(mockAddBanner).toHaveBeenCalled()

        act(() => mockHistory.push('/app/ai-agent'))
        expect(mockRemoveBanner).toHaveBeenCalled()
    })
})
