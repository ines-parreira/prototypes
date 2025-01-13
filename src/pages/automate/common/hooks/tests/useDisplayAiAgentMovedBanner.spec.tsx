import {act} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {createBrowserHistory} from 'history'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ReactNode} from 'react'
import {Router} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'
import {assumeMock} from 'utils/testing'

import {useDisplayAiAgentMovedBanner} from '../useDisplayAiAgentMovedBanner'

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const mockHistory = createBrowserHistory()

describe('useDisplayAiAgentMovedBanner', () => {
    const wrapper = ({children}: {children: ReactNode}) => (
        <Router history={mockHistory}>{children}</Router>
    )

    beforeEach(() => {
        mockFlags({[FeatureFlagKey.ConvAiStandaloneMenu]: true})
        mockUseAppSelector.mockReturnValue(true)
    })

    it('should display ai-agent-moved info banner when accessing Automate pages', () => {
        renderHook(() => useDisplayAiAgentMovedBanner(), {wrapper})

        act(() => mockHistory.push('/app/automation'))
        expect(mockAddBanner).toHaveBeenCalled()

        act(() => mockHistory.push('/app/ai-agent'))
        expect(mockRemoveBanner).toHaveBeenCalled()
    })

    it('should not display ai-agent-moved info banner when hasAutomate is false', () => {
        mockUseAppSelector.mockReturnValue(false)

        renderHook(() => useDisplayAiAgentMovedBanner(), {wrapper})

        act(() => mockHistory.push('/app/automation'))
        expect(mockAddBanner).not.toHaveBeenCalled()
    })
})
