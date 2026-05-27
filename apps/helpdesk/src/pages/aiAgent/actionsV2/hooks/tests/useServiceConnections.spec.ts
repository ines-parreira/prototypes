import { renderHook } from '@repo/testing'

import { useListTrackstarConnections } from 'models/workflows/queries'

import { useServiceConnections } from '../useServiceConnections'

jest.mock('models/workflows/queries', () => ({
    useListTrackstarConnections: jest.fn(),
}))
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const callSelect = (selectOption: unknown, data: unknown) => {
    const opts = selectOption as {
        select?: (input: unknown) => unknown
    }
    return opts.select ? opts.select(data) : data
}

describe('useServiceConnections()', () => {
    beforeEach(() => {
        mockUseListTrackstarConnections.mockReset()
    })

    it('shapes successful connections into a byIntegration map', () => {
        mockUseListTrackstarConnections.mockImplementation((_, options) => {
            const shaped = callSelect(options, [
                {
                    integration_name: 'shipbob',
                    error: false,
                    connection_id: 'conn-1',
                },
                {
                    integration_name: 'shiphero',
                    error: true,
                    connection_id: 'conn-2',
                },
            ])
            return {
                data: shaped,
                isError: false,
                isInitialLoading: false,
                error: null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
        })

        const { result } = renderHook(() =>
            useServiceConnections({ storeName: 's', storeType: 'shopify' }),
        )

        expect(result.current.byIntegration.shipbob).toEqual({
            integrationName: 'shipbob',
            isFailed: false,
            connectionId: 'conn-1',
        })
        expect(result.current.byIntegration.shiphero?.isFailed).toBe(true)
        expect(result.current.isError).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns isError when the query errored', () => {
        mockUseListTrackstarConnections.mockReturnValue({
            data: undefined,
            isError: true,
            isInitialLoading: false,
            error: new Error('boom'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        const { result } = renderHook(() =>
            useServiceConnections({ storeName: 's', storeType: 'shopify' }),
        )

        expect(result.current.isError).toBe(true)
        expect(result.current.byIntegration).toEqual({})
    })
})
