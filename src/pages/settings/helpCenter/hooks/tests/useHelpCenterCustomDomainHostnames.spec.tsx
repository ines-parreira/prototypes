import { waitFor } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import useHelpCenterCustomDomainHostnames from '../useHelpCenterCustomDomainHostnames'

const mockedListCustomDomains = jest.fn()
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => ({
        client: {
            listCustomDomains: mockedListCustomDomains,
        },
    }),
}))

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

describe('useHelpCenterCustomDomainUrls', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should initialize with empty customDomainUrls and isLoading true', () => {
        const { result } = renderHook(() =>
            useHelpCenterCustomDomainHostnames(1),
        )

        expect(result.current.customDomainHostnames).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })

    it('should return empty customDomainUrls and isLoading false if helpCenterId is not provided', () => {
        const { result } = renderHook(() =>
            useHelpCenterCustomDomainHostnames(),
        )

        expect(result.current.customDomainHostnames).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it.skip('should set loading state and fetch custom domains', async () => {
        const mockDomains = [
            { hostname: 'example.com', status: 'active' },
            { hostname: 'test.com', status: 'active' },
        ]
        mockedListCustomDomains.mockResolvedValueOnce({
            data: { data: mockDomains },
        })

        const { result } = renderHook(() =>
            useHelpCenterCustomDomainHostnames(1),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.customDomainHostnames).toEqual([
                'example.com',
                'test.com',
            ])
        })
        expect(result.current.isLoading).toBe(false)
    })

    it.skip('should not set customDomainHostnames if the custom domain is not active', async () => {
        const mockDomains = [
            { hostname: 'example.com', status: 'pending' },
            { hostname: 'test.com', status: 'unknown' },
            { hostname: 'active-domain.com', status: 'active' },
        ]
        mockedListCustomDomains.mockResolvedValueOnce({
            data: { data: mockDomains },
        })

        const { result } = renderHook(() =>
            useHelpCenterCustomDomainHostnames(1),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(true))
        await waitFor(() =>
            expect(result.current.customDomainHostnames).toEqual([
                'active-domain.com',
            ]),
        )
        expect(result.current.isLoading).toBe(false)
    })
})
