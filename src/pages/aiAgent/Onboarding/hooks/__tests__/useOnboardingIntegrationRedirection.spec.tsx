import { act, renderHook } from '@testing-library/react-hooks'

import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'

import { useOnboardingIntegrationRedirection } from '../useOnboardingIntegrationRedirection'

describe('useOnboardingIntegrationRedirection', () => {
    const LOCAL_STORAGE_KEY = 'aiagent_onboarding_integration_redirection'

    it('should redirect to onboarding if redirectUrl is in localStorage', () => {
        const redirectUrl = 'http://example.com/onboarding'
        renderHook(() =>
            useLocalStorageWithExpiry(LOCAL_STORAGE_KEY, 1000, redirectUrl),
        )
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            result.current.redirectToOnboardingIfOnboarding('type1', 'id1')
        })

        expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull()
        expect(windowOpenSpy).toHaveBeenCalledWith(
            `${redirectUrl}?integrationType=type1&integrationId=id1`,
            '_self',
        )

        windowOpenSpy.mockRestore()
    })

    it('should not redirect if redirectUrl is not in localStorage', () => {
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            result.current.redirectToOnboardingIfOnboarding('type1', 'id1')
        })

        expect(windowOpenSpy).not.toHaveBeenCalled()
        windowOpenSpy.mockRestore()
    })

    it('should set localStorage and redirect to integration', () => {
        const integrationUrl = 'http://example.com/integration'
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            result.current.redirectToIntegration(integrationUrl)
        })

        expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toContain(
            window.location.href,
        )
        expect(windowOpenSpy).toHaveBeenCalledWith(integrationUrl, '_self')
        windowOpenSpy.mockRestore()
    })
})
