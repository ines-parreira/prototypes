import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { useCreateStoreSnippetHelpCenter } from 'models/aiAgent/queries'
import { useGetHelpCenterList } from 'models/helpCenter/queries'

import { useGetOrCreateSnippetHelpCenter } from '../useGetOrCreateSnippetHelpCenter'

jest.mock('models/aiAgent/queries')
jest.mock('models/helpCenter/queries')
jest.mock('@repo/logging')

describe('useGetOrCreateSnippetHelpCenter', () => {
    const accountDomain = 'test-domain'
    const shopName = 'test-shop'

    beforeEach(() => {
        jest.resetAllMocks()
    })

    const renderUseGetOrCreateSnippetHelpCenterHook = () => {
        return renderHook(() =>
            useGetOrCreateSnippetHelpCenter({ accountDomain, shopName }),
        )
    }

    const mockUseGetHelpCenterList = (
        data: any,
        error: Error | null = null,
        isLoading: boolean = false,
    ) => {
        ;(useGetHelpCenterList as jest.Mock).mockReturnValue({
            data,
            error,
            isLoading,
        })
    }

    const mockUseCreateStoreSnippetHelpCenter = (
        mutateAsync: jest.Mock,
        error: Error | null = null,
        isLoading: boolean = false,
        status: 'idle' | 'loading' | 'success' | 'error' = 'idle',
    ) => {
        ;(useCreateStoreSnippetHelpCenter as jest.Mock).mockReturnValue({
            mutateAsync,
            error,
            isLoading,
            status,
        })
    }

    it('returns existing help center if it exists', async () => {
        const mockHelpCenter = { id: 1, name: 'Test Help Center' }
        mockUseGetHelpCenterList({ data: { data: [mockHelpCenter] } })
        mockUseCreateStoreSnippetHelpCenter(jest.fn())

        const { result } = renderUseGetOrCreateSnippetHelpCenterHook()

        await waitFor(() => expect(result.current.helpCenter).not.toBeNull())

        expect(result.current).toEqual({
            helpCenter: mockHelpCenter,
            isLoading: false,
        })
    })

    it('creates a new help center if none exists', async () => {
        const mockCreatedHelpCenter = {
            id: 2,
            name: 'Created Help Center',
            shop_name: shopName,
        }
        const createHelpCenter = jest
            .fn()
            .mockResolvedValue({ data: mockCreatedHelpCenter })

        mockUseGetHelpCenterList({ data: { data: [] } })
        mockUseCreateStoreSnippetHelpCenter(createHelpCenter)

        const { result } = renderUseGetOrCreateSnippetHelpCenterHook()

        await waitFor(() => expect(result.current.helpCenter).not.toBeNull())

        expect(createHelpCenter).toHaveBeenCalledWith([accountDomain, shopName])
        expect(result.current).toEqual({
            helpCenter: mockCreatedHelpCenter,
            isLoading: false,
        })
    })

    it('returns loading if loading existing help center', () => {
        mockUseGetHelpCenterList(null, null, true)
        mockUseCreateStoreSnippetHelpCenter(jest.fn())

        const { result } = renderUseGetOrCreateSnippetHelpCenterHook()

        expect(result.current).toEqual({ helpCenter: null, isLoading: true })
    })

    it('returns null if error in fetching existing help center', () => {
        mockUseGetHelpCenterList(null, new Error('Fetch error'))
        mockUseCreateStoreSnippetHelpCenter(jest.fn())

        const { result } = renderUseGetOrCreateSnippetHelpCenterHook()

        expect(result.current).toEqual({ isLoading: false, helpCenter: null })
    })
})
