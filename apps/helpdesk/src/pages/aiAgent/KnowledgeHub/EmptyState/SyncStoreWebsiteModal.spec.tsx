import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SyncStoreWebsiteModal } from './SyncStoreWebsiteModal'
import { useListenToDocumentEvent } from './utils'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))
jest.mock('../../hooks/useSyncStoreDomain', () => ({
    useSyncStoreDomain: jest.fn(() => ({
        handleTriggerSync: jest.fn(),
        handleOnSync: jest.fn().mockResolvedValue(undefined),
        handleOnCancel: jest.fn(),
    })),
}))
jest.mock(
    '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
    () => ({
        useIngestionDomainBannerDismissed: jest.fn(() => ({
            resetBanner: jest.fn(),
            dismissBanner: jest.fn(),
        })),
    }),
)
jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

describe('SyncStoreWebsiteModal', () => {
    let eventCallback: (event?: Event) => void

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                eventCallback = callback
            },
        )
    })

    describe('modal visibility', () => {
        it('is closed by default', () => {
            render(<SyncStoreWebsiteModal helpCenterId={1} />)

            expect(
                screen.queryByRole('heading', { name: 'Sync store website' }),
            ).not.toBeInTheDocument()
        })

        it('opens when OPEN_SYNC_WEBSITE_MODAL event is dispatched', async () => {
            render(<SyncStoreWebsiteModal helpCenterId={1} />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Sync store website' }),
            ).toBeInTheDocument()
        })

        it('closes when Cancel button is clicked', async () => {
            render(<SyncStoreWebsiteModal helpCenterId={1} />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Sync store website' }),
            ).toBeInTheDocument()

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Sync store website',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('without existing website sync', () => {
        it('renders the simple sync message', async () => {
            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={false}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(
                    'Sync your store website to allow AI Agent to use your site content and product information.',
                ),
            ).toBeInTheDocument()
        })

        it('does not show warning banner', async () => {
            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={false}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.queryByText(/This action cannot be undone/),
            ).not.toBeInTheDocument()
        })

        it('calls handleOnSync when Sync button is clicked', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const handleOnSync = jest.fn().mockResolvedValue(undefined)
            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync: jest.fn(),
                handleOnSync,
                handleOnCancel: jest.fn(),
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={false}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', {
                name: /Sync/,
            })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(handleOnSync).toHaveBeenCalled()
            })
        })

        it('closes modal after successful sync', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const handleOnSync = jest.fn().mockResolvedValue(undefined)
            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync: jest.fn(),
                handleOnSync,
                handleOnCancel: jest.fn(),
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={false}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', {
                name: /Sync/,
            })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Sync store website',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('dismisses banner and closes modal on sync error', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const { useIngestionDomainBannerDismissed } = jest.requireMock(
                '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
            )

            const handleOnSync = jest
                .fn()
                .mockRejectedValue(new Error('Sync failed'))
            const dismissBanner = jest.fn()

            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync: jest.fn(),
                handleOnSync,
                handleOnCancel: jest.fn(),
            })
            useIngestionDomainBannerDismissed.mockReturnValue({
                resetAllBanner: jest.fn(),
                dismissBanner,
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={false}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', {
                name: /Sync/,
            })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(dismissBanner).toHaveBeenCalled()
                expect(
                    screen.queryByRole('heading', {
                        name: 'Sync store website',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('with existing website sync', () => {
        it('renders the warning message', async () => {
            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={true}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(
                    /Syncing will replace all existing questions and answers/,
                ),
            ).toBeInTheDocument()
        })

        it('shows warning banner', async () => {
            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={true}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(/This action cannot be undone/),
            ).toBeInTheDocument()
        })

        it('triggers handleTriggerSync when modal opens', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const handleTriggerSync = jest.fn()
            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync,
                handleOnSync: jest.fn().mockResolvedValue(undefined),
                handleOnCancel: jest.fn(),
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={true}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            expect(handleTriggerSync).toHaveBeenCalled()
        })

        it('calls handleOnSync when Sync button is clicked', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const handleOnSync = jest.fn().mockResolvedValue(undefined)
            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync: jest.fn(),
                handleOnSync,
                handleOnCancel: jest.fn(),
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={true}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', {
                name: /Sync/,
            })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(handleOnSync).toHaveBeenCalled()
            })
        })

        it('resets banner after successful sync', async () => {
            const { useSyncStoreDomain } = jest.requireMock(
                '../../hooks/useSyncStoreDomain',
            )
            const { useIngestionDomainBannerDismissed } = jest.requireMock(
                '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
            )

            const handleOnSync = jest.fn().mockResolvedValue(undefined)
            const resetBanner = jest.fn()

            useSyncStoreDomain.mockReturnValue({
                handleTriggerSync: jest.fn(),
                handleOnSync,
                handleOnCancel: jest.fn(),
            })
            useIngestionDomainBannerDismissed.mockReturnValue({
                resetBanner,
                dismissBanner: jest.fn(),
            })

            render(
                <SyncStoreWebsiteModal
                    hasWebsiteSync={true}
                    helpCenterId={1}
                />,
            )

            await act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', {
                name: /Sync/,
            })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(resetBanner).toHaveBeenCalled()
            })
        })
    })
})
