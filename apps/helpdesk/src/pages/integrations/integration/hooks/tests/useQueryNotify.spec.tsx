import React from 'react'

import { render, renderHook } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { createPortal } from 'react-dom'

import { Toaster } from '@gorgias/axiom'

import useQueryNotify from '../useQueryNotify'

const renderUseQueryNotify = (initialEntries: string[]) => {
    // Pre-mount the Toaster so it's subscribed before the hook's first
    // useEffect fires (sonner doesn't replay toasts published before subscribe).
    render(<>{createPortal(<Toaster />, document.body)}</>)

    return renderHook(() => useQueryNotify(), { initialEntries })
}

describe('useQueryNotify()', () => {
    it('should do nothing if it has no error or message', () => {
        renderUseQueryNotify(['/'])

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should show an error toast if it has an error', async () => {
        renderUseQueryNotify(['/?error=need_scope_update'])

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'You need to update your app permissions in order to do that.',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should show an info toast if it has a message', async () => {
        renderUseQueryNotify(['/?message=you+should+see+me+in+snaps'])

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'you should see me in snaps',
            })
            expect(toast).toHaveAttribute('data-intent', 'info')
        })
    })

    it('should show a warning toast when message_type=warning is provided with a message', async () => {
        renderUseQueryNotify([
            '/?message=you+should+see+me+in+snaps&message_type=warning',
        ])

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'you should see me in snaps',
            })
            expect(toast).toHaveAttribute('data-intent', 'warning')
        })
    })

    it('should show a warning toast when message_type=warning is provided with an error', async () => {
        renderUseQueryNotify(['/?error=need_scope_update&message_type=warning'])

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'You need to update your app permissions in order to do that.',
            })
            expect(toast).toHaveAttribute('data-intent', 'warning')
        })
    })

    it('should show a success toast when message_type=success is provided with a message', async () => {
        renderUseQueryNotify([
            '/?message=integration+connected&message_type=success',
        ])

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'integration connected',
            })
            expect(toast).toHaveAttribute('data-intent', 'success')
        })
    })
})
