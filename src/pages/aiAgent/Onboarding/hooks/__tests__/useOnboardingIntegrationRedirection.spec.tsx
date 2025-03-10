import { act, renderHook } from '@testing-library/react-hooks'

import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'
import { IntegrationType } from 'models/integration/types'

import {
    LOCAL_STORAGE_ID_KEY,
    LOCAL_STORAGE_KEY,
    LOCAL_STORAGE_TYPE_KEY,
    useOnboardingIntegrationRedirection,
} from '../useOnboardingIntegrationRedirection'

describe('useOnboardingIntegrationRedirection', () => {
    it('should redirect to onboarding if redirectUrl is in localStorage and it is the same integration type', () => {
        const redirectUrl = 'http://example.com/onboarding'
        localStorage.setItem(
            LOCAL_STORAGE_TYPE_KEY,
            // necessary since it's read with JSON.parse
            `"${IntegrationType.Email}"`,
        )
        renderHook(() =>
            useLocalStorageWithExpiry(LOCAL_STORAGE_KEY, 1000, redirectUrl),
        )
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(false),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            result.current.redirectToOnboardingIfOnboarding(
                IntegrationType.Email,
                'id1',
            )
        })

        expect(windowOpenSpy).toHaveBeenCalledWith(redirectUrl, '_self')

        windowOpenSpy.mockRestore()
    })

    it('should not redirect if redirectUrl is not in localStorage', () => {
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        localStorage.setItem(
            LOCAL_STORAGE_TYPE_KEY,
            // necessary since it's read with JSON.parse
            `"${IntegrationType.Email}"`,
        )

        act(() => {
            result.current.redirectToOnboardingIfOnboarding(
                IntegrationType.Email,
                'id1',
            )
        })

        expect(windowOpenSpy).not.toHaveBeenCalled()
        windowOpenSpy.mockRestore()
    })

    it('should set localStorage and redirect to integration', () => {
        const integrationUrl = 'http://example.com/integration'
        const integrationType: IntegrationType = IntegrationType.Email
        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            result.current.redirectToIntegration(
                integrationUrl,
                integrationType,
            )
        })

        const actualIntegrationType = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_TYPE_KEY) as string,
        )
        expect(integrationType).toBe(actualIntegrationType.toString())
        expect(windowOpenSpy).toHaveBeenCalledWith(integrationUrl, '_self')
        windowOpenSpy.mockRestore()
    })

    it('should not redirect if the integration type is incorrect', () => {
        const integrationUrl = 'http://example.com/integration'
        const { result: onboardingRender } = renderHook(() =>
            useOnboardingIntegrationRedirection(true),
        )
        const windowOpenSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)

        act(() => {
            onboardingRender.current.redirectToIntegration(
                integrationUrl,
                IntegrationType.Sms,
            )
        })

        const { result: integrationRender } = renderHook(() =>
            useOnboardingIntegrationRedirection(true),
        )

        integrationRender.current.redirectToOnboardingIfOnboarding(
            IntegrationType.Email,
            'id1',
        )

        expect(windowOpenSpy).toHaveBeenCalledTimes(1)
        windowOpenSpy.mockRestore()
    })

    it('should clear the integration type and id after redirecting back to onboarding', () => {
        const expectedId = '123'
        const expectedType = `"${IntegrationType.Email}"`

        localStorage.setItem(
            LOCAL_STORAGE_TYPE_KEY,
            // necessary since it's read with JSON.parse
            expectedType,
        )
        localStorage.setItem(LOCAL_STORAGE_ID_KEY, expectedId)

        const { result } = renderHook(() =>
            useOnboardingIntegrationRedirection(true),
        )
        result.current.integrationId = expectedId
        result.current.integrationType = JSON.parse(expectedType)

        expect(localStorage.getItem(LOCAL_STORAGE_TYPE_KEY)).toBe(null)
        expect(localStorage.getItem(LOCAL_STORAGE_ID_KEY)).toBe(null)
    })
})
