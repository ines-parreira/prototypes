import { renderHook } from '@repo/testing'
import { act, screen } from '@testing-library/react'

import { fetchEmailMigrationBannerStatus } from 'models/integration/resources/email'

import useMigrationBannerStatus from '../useMigrationBannerStatus'

jest.mock('models/integration/resources/email')
const mockFetchEmailMigrationBannerStatus =
    fetchEmailMigrationBannerStatus as jest.Mock

describe('useMigrationBannerStatus', () => {
    it('shows an error toast when the fetch returns an API error', async () => {
        mockFetchEmailMigrationBannerStatus.mockRejectedValueOnce({
            response: {
                status: 500,
                data: { error: { msg: 'Migration banner unavailable' } },
            },
        })

        const { result } = renderHook(() => useMigrationBannerStatus())
        await act(async () => {
            await result.current()
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Migration banner unavailable',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('does not show a toast when the response is a 403', async () => {
        mockFetchEmailMigrationBannerStatus.mockRejectedValueOnce({
            response: {
                status: 403,
                data: { error: { msg: 'Forbidden' } },
            },
        })

        const { result } = renderHook(() => useMigrationBannerStatus())
        await act(async () => {
            await result.current()
        })

        expect(
            screen.queryByRole('status', { hidden: true }),
        ).not.toBeInTheDocument()
    })

    it('does not show a toast when the error has no response payload', async () => {
        mockFetchEmailMigrationBannerStatus.mockRejectedValueOnce(
            new Error('Network error'),
        )

        const { result } = renderHook(() => useMigrationBannerStatus())
        await act(async () => {
            await result.current()
        })

        expect(
            screen.queryByRole('status', { hidden: true }),
        ).not.toBeInTheDocument()
    })
})
