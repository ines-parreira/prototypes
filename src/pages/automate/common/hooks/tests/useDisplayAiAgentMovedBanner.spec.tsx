import React, { ReactNode } from 'react'

import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { createBrowserHistory } from 'history'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Router } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import { useDisplayAiAgentMovedBanner } from '../useDisplayAiAgentMovedBanner'

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
    const wrapper = ({ children }: { children: ReactNode }) => (
        <Router history={mockHistory}>{children}</Router>
    )

    beforeEach(() => {
        mockFlags({ [FeatureFlagKey.ConvAiStandaloneMenu]: true })
        mockUseAppSelector.mockReturnValue(true)
    })

    it('should return true when accessing Automate pages with required conditions met', () => {
        const { result } = renderHook(() => useDisplayAiAgentMovedBanner(), {
            wrapper,
        })

        act(() => mockHistory.push('/app/automation'))
        expect(result.current).toBe(true)

        act(() => mockHistory.push('/app/other'))
        expect(result.current).toBe(false)
    })

    it('should return false when hasAutomate is false', () => {
        mockUseAppSelector.mockReturnValue(false)

        const { result } = renderHook(() => useDisplayAiAgentMovedBanner(), {
            wrapper,
        })

        act(() => mockHistory.push('/app/automation'))
        expect(result.current).toBe(false)
    })

    it('should return false when feature flag is disabled', () => {
        mockFlags({ [FeatureFlagKey.ConvAiStandaloneMenu]: false })

        const { result } = renderHook(() => useDisplayAiAgentMovedBanner(), {
            wrapper,
        })

        act(() => mockHistory.push('/app/automation'))
        expect(result.current).toBe(false)
    })
})
