import { act } from '@testing-library/react'

import { IntegrationType, Magento2Integration } from 'models/integration/types'
import { renderHook } from 'utils/testing/renderHook'

import useStoreUpdater from '../../../../General/hooks/useStoreUpdater'
import { useManualForm } from '../useManualForm'

jest.mock('../../../../General/hooks/useStoreUpdater')

const mockIntegration = {
    id: 123,
    name: 'Test Store',
    type: IntegrationType.Magento2,
    meta: {
        admin_url_suffix: '/admin',
        store_url: 'https://test-store.com',
        is_manual: true,
        import_state: {
            is_over: false,
        },
    },
    created_datetime: '2024-01-01T00:00:00Z',
    deactivated_datetime: null,
} as Magento2Integration

const mockRefetchStore = jest.fn()

describe('useManualForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: jest.fn(),
            isUpdating: false,
        })
    })

    it('should return correct default values', () => {
        const { result } = renderHook(() =>
            useManualForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.defaultValues).toEqual({
            adminURLSuffix: '/admin',
            consumerKey: '',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        })
        expect(result.current.storeURL).toBe('https://test-store.com')
        expect(result.current.isSubmitting).toBe(false)
    })

    it('should call updateIntegration with auth data when secrets are provided', async () => {
        const mockUpdateIntegration = jest.fn()
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: mockUpdateIntegration,
            isUpdating: false,
        })

        const { result } = renderHook(() =>
            useManualForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        const testValues = {
            adminURLSuffix: '/admin',
            consumerKey: 'test-key',
            consumerSecret: 'test-secret',
            accessToken: 'test-token',
            accessTokenSecret: 'test-token-secret',
        }

        await act(async () => {
            await result.current.handleUpdate(testValues)
        })

        expect(mockUpdateIntegration).toHaveBeenCalledWith({
            id: 123,
            data: {
                name: 'Test Store',
                connections: [
                    {
                        data: {
                            consumer_key: 'test-key',
                            consumer_secret: 'test-secret',
                            oauth_token: 'test-token',
                            oauth_token_secret: 'test-token-secret',
                        },
                    },
                ],
                meta: {
                    admin_url_suffix: '/admin',
                    store_url: 'https://test-store.com',
                    is_manual: true,
                    import_state: {
                        is_over: false,
                    },
                },
            },
        })
    })

    it('should call updateIntegration without auth data when no secrets are provided', async () => {
        const mockUpdateIntegration = jest.fn()
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: mockUpdateIntegration,
            isUpdating: false,
        })

        const { result } = renderHook(() =>
            useManualForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        const testValues = {
            adminURLSuffix: '/admin',
            consumerKey: '',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        }

        await act(async () => {
            await result.current.handleUpdate(testValues)
        })

        expect(mockUpdateIntegration).toHaveBeenCalledWith({
            id: 123,
            data: {
                name: 'Test Store',
                meta: {
                    admin_url_suffix: '/admin',
                    store_url: 'https://test-store.com',
                    is_manual: true,
                    import_state: {
                        is_over: false,
                    },
                },
            },
        })
    })

    it('should reflect isUpdating state from useStoreUpdater', () => {
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: jest.fn(),
            isUpdating: true,
        })

        const { result } = renderHook(() =>
            useManualForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.isSubmitting).toBe(true)
    })
})
