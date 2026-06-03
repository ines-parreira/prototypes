import { screen, waitFor } from '@testing-library/react'
import type { AxiosResponse } from 'axios'
import { AxiosHeaders } from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {
    default as client,
    createClient,
    initializeNewReleaseHandler,
} from '../client'

const { isCallActiveMock } = vi.hoisted(() => ({
    isCallActiveMock: vi.fn(() => false),
}))

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@repo/utils')>()

    return {
        ...actual,
        isCallActive: isCallActiveMock,
    }
})

const newReleaseResponse = {
    headers: new AxiosHeaders({ 'x-gorgias-release': '2' }),
} as AxiosResponse

describe('client resources', () => {
    const mockedServer = new MockAdapter(client)

    beforeEach(() => {
        mockedServer.reset()
        isCallActiveMock.mockReturnValue(false)
        vi.restoreAllMocks()
        vi.clearAllMocks()
        window.GORGIAS_RELEASE = '1'
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('creates a client with the expected default headers', () => {
        expect(createClient().defaults.headers).toMatchObject({
            'X-CSRF-Token': 'abcd',
            'X-Gorgias-User-Client': 'web',
        })
    })

    it('resolves requests with data', async () => {
        mockedServer.onGet('/api').reply(
            200,
            {
                data: {
                    foo_bar: 1,
                },
            },
            { 'x-gorgias-release': '1' },
        )

        await expect(client.get('/api')).resolves.toMatchObject({
            data: {
                data: {
                    foo_bar: 1,
                },
            },
        })
    })

    it('registers the release interceptor on the shared client', () => {
        const useSpy = vi.spyOn(client.interceptors.response, 'use')

        initializeNewReleaseHandler()

        expect(useSpy).toHaveBeenCalledTimes(1)
    })

    describe('new release handling', () => {
        let handleNewRelease: typeof import('../client').handleNewRelease
        let timeoutTime: typeof import('../client').timeoutTime
        let render: typeof import('@repo/testing/vitest').render
        let userEvent: typeof import('@repo/testing/vitest').userEvent

        beforeEach(async () => {
            vi.resetModules()
            const mod = await import('../client')
            handleNewRelease = mod.handleNewRelease
            timeoutTime = mod.timeoutTime

            // Re-import the render helper after resetModules so its <Toaster />
            // and the freshly re-imported client share the same axiom instance.
            // Without this, toast.warning() writes to a store no Toaster observes.
            const testing = await import('@repo/testing/vitest')
            render = testing.render
            userEvent = testing.userEvent
        })

        it('shows a warning toast and reloads on a new release', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            render(<div />)

            handleNewRelease()(newReleaseResponse)
            vi.advanceTimersByTime(timeoutTime)

            await waitFor(() => {
                const toast = screen.getByRole('status')
                expect(toast).toHaveTextContent(
                    'An update is available for Gorgias',
                )
                expect(toast).toHaveAttribute('data-intent', 'warning')
            })

            vi.advanceTimersByTime(60000)

            expect(window.location.reload).toHaveBeenCalledTimes(1)
        })

        it('reloads immediately when clicking Reload in the toast', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            const user = userEvent.setup({
                advanceTimers: vi.advanceTimersByTime,
            })
            render(<div />)

            handleNewRelease()(newReleaseResponse)
            vi.advanceTimersByTime(timeoutTime)

            await waitFor(() => {
                expect(screen.getByRole('status')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: 'Reload' }))

            expect(window.location.reload).toHaveBeenCalledTimes(1)
        })

        it('cancels the auto-reload when clicking Cancel in the toast', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            const user = userEvent.setup({
                advanceTimers: vi.advanceTimersByTime,
            })
            render(<div />)

            handleNewRelease()(newReleaseResponse)
            vi.advanceTimersByTime(timeoutTime)

            await waitFor(() => {
                expect(screen.getByRole('status')).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            vi.advanceTimersByTime(60000)

            expect(window.location.reload).not.toHaveBeenCalled()
        })

        it('does not schedule a reload while a call is active', () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            render(<div />)

            isCallActiveMock.mockReturnValue(true)

            handleNewRelease()(newReleaseResponse)
            vi.runAllTimers()

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })

        it('skips reload if a call becomes active during auto-reload', async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true })
            render(<div />)

            handleNewRelease()(newReleaseResponse)
            vi.advanceTimersByTime(timeoutTime)

            await waitFor(() => {
                expect(screen.getByRole('status')).toBeInTheDocument()
            })

            isCallActiveMock.mockReturnValue(true)
            vi.advanceTimersByTime(60000)

            expect(window.location.reload).not.toHaveBeenCalled()
        })
    })
})
