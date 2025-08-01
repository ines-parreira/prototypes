import { renderHook } from '@testing-library/react'

import { IntegrationType } from '@gorgias/helpdesk-client'

import { useEmailIntegrations } from '../useEmailIntegrations'

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/integrations/integration/components/email/helpers', () => ({
    isBaseEmailIntegration: jest.fn(),
}))

const mockUseAllIntegrations = jest.mocked(
    require('hooks/useAllIntegrations').default,
)

const mockIsBaseEmailIntegration = jest.mocked(
    require('pages/integrations/integration/components/email/helpers')
        .isBaseEmailIntegration,
)

describe('useEmailIntegrations', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAllIntegrations.mockReturnValue({
            integrations: [],
            isLoading: false,
            refetch: jest.fn(),
        })

        mockIsBaseEmailIntegration.mockReturnValue(false)
    })

    it('should transform email integrations correctly', () => {
        mockUseAllIntegrations.mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: IntegrationType.Gmail,
                    meta: { address: 'support@gmail.com' },
                },
                {
                    id: 2,
                    type: IntegrationType.Outlook,
                    meta: { address: 'sales@outlook.com' },
                },
                {
                    id: 3,
                    type: IntegrationType.Email,
                    meta: { address: 'hello@company.com' },
                },
                {
                    id: 4,
                    type: IntegrationType.Shopify,
                    meta: { some_other_field: 'value' },
                },
            ],
            isLoading: false,
            refetch: jest.fn(),
        })

        const { result } = renderHook(() => useEmailIntegrations())

        expect(result.current).toEqual([
            { provider: IntegrationType.Gmail, email: 'support@gmail.com' },
            { provider: IntegrationType.Outlook, email: 'sales@outlook.com' },
            { provider: IntegrationType.Email, email: 'hello@company.com' },
        ])
    })

    it('should filter out integrations without email addresses', () => {
        mockUseAllIntegrations.mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: IntegrationType.Gmail,
                    meta: { address: 'support@gmail.com' },
                },
                {
                    id: 2,
                    type: IntegrationType.Outlook,
                    meta: {},
                },
                {
                    id: 3,
                    type: IntegrationType.Email,
                    meta: { address: null },
                },
            ],
            isLoading: false,
            refetch: jest.fn(),
        })

        const { result } = renderHook(() => useEmailIntegrations())

        expect(result.current).toEqual([
            { provider: 'gmail', email: 'support@gmail.com' },
        ])
    })

    it('should filter out Gorgias internal emails but keep Gmail and Outlook', () => {
        mockUseAllIntegrations.mockReturnValue({
            integrations: [
                {
                    id: 1,
                    type: IntegrationType.Gmail,
                    meta: { address: 'support@gmail.com' },
                },
                {
                    id: 4,
                    type: IntegrationType.Gmail,
                    meta: { address: 'support@email.gorgias.com' },
                },
                {
                    id: 5,
                    type: IntegrationType.Outlook,
                    meta: { address: 'sales@company.com' },
                },
                {
                    id: 2,
                    type: IntegrationType.Email,
                    meta: { address: 'hello@company.com' },
                },
                {
                    id: 3,
                    type: IntegrationType.Email,
                    meta: { address: 'support@email.gorgias.com' },
                },
            ],
            isLoading: false,
            refetch: jest.fn(),
        })

        mockIsBaseEmailIntegration.mockImplementation((integration: any) => {
            return (
                integration.meta.address === 'support@email.gorgias.com' &&
                integration.type === IntegrationType.Email
            )
        })

        const { result } = renderHook(() => useEmailIntegrations())

        expect(result.current).toEqual([
            { provider: IntegrationType.Gmail, email: 'support@gmail.com' },
            {
                provider: IntegrationType.Gmail,
                email: 'support@email.gorgias.com',
            },
            { provider: IntegrationType.Outlook, email: 'sales@company.com' },
            { provider: IntegrationType.Email, email: 'hello@company.com' },
        ])

        expect(mockIsBaseEmailIntegration).toHaveBeenCalledTimes(2)
    })

    it('should return empty array when no email integrations exist', () => {
        const { result } = renderHook(() => useEmailIntegrations())

        expect(result.current).toEqual([])
    })

    it('should return empty array when loading', () => {
        mockUseAllIntegrations.mockImplementation(() => ({
            integrations: [],
            isLoading: true,
            refetch: jest.fn(),
        }))

        const { result } = renderHook(() => useEmailIntegrations())

        expect(result.current).toEqual([])
    })

    it('should make a single API call to get all integrations', () => {
        renderHook(() => useEmailIntegrations())

        expect(mockUseAllIntegrations).toHaveBeenCalledWith()
        expect(mockUseAllIntegrations).toHaveBeenCalledTimes(1)
    })
})
