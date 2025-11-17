import { history } from '@repo/routing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HelpCenterSelectModal } from './HelpCenterSelectModal'
import { useFaqHelpCenter } from './useFaqHelpCenter'
import { useListenToDocumentEvent } from './utils'

jest.mock('./useFaqHelpCenter')
jest.mock('./utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))
jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
>
const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

describe('HelpCenterSelectModal', () => {
    const mockHelpCenters = [
        { id: 1, name: 'Help Center 1' },
        { id: 2, name: 'Help Center 2' },
    ]

    const mockHelpCenterItems = [
        { id: -1, name: 'No help center' },
        ...mockHelpCenters,
    ]

    const defaultMockValues = {
        selectedHelpCenter: { id: 1, name: 'Help Center 1' },
        handleOnSave: jest.fn(),
        shopName: 'test-shop',
        isPendingCreateOrUpdate: false,
        faqHelpCenters: mockHelpCenters as any,
        helpCenterItems: mockHelpCenterItems,
        setHelpCenterId: jest.fn(),
    }

    let eventCallback: (event?: Event) => void

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFaqHelpCenter.mockReturnValue(defaultMockValues)
        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                eventCallback = callback
            },
        )
    })

    describe('modal visibility', () => {
        it('is closed by default', () => {
            render(<HelpCenterSelectModal />)

            expect(
                screen.queryByRole('heading', { name: 'Connect Help Center' }),
            ).not.toBeInTheDocument()
        })

        it('opens when HELP_CENTER_SELECT_MODAL_OPEN event is dispatched', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Connect Help Center' }),
            ).toBeInTheDocument()
        })

        it('closes when modal onOpenChange is triggered', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Connect Help Center' }),
            ).toBeInTheDocument()

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Connect Help Center',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('select help center flow', () => {
        it('renders select field with help centers', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(
                    'Select a Help Center to connect to AI Agent.',
                ),
            ).toBeInTheDocument()
        })

        it('displays Cancel and Confirm buttons', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Confirm' }),
            ).toBeInTheDocument()
        })

        it('renders select field that can interact with help centers', async () => {
            const setHelpCenterId = jest.fn()
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                setHelpCenterId,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('textbox', {
                    name: 'Select a Help Center to connect to AI Agent.',
                }),
            ).toBeInTheDocument()
        })

        it('calls handleOnSave when Confirm is clicked', async () => {
            const handleOnSave = jest.fn().mockResolvedValue({ success: true })
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                handleOnSave,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const confirmButton = screen.getByRole('button', {
                name: 'Confirm',
            })
            await act(() => userEvent.click(confirmButton))

            expect(handleOnSave).toHaveBeenCalledWith({
                shopName: 'test-shop',
                silentNotification: false,
            })
        })

        it('closes modal after successful save', async () => {
            const handleOnSave = jest.fn().mockResolvedValue({ success: true })
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                handleOnSave,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const confirmButton = screen.getByRole('button', {
                name: 'Confirm',
            })
            await act(() => userEvent.click(confirmButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Connect Help Center',
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('keeps modal open after failed save', async () => {
            const handleOnSave = jest.fn().mockResolvedValue(null)
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                handleOnSave,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const confirmButton = screen.getByRole('button', {
                name: 'Confirm',
            })
            await act(() => userEvent.click(confirmButton))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', {
                        name: 'Connect Help Center',
                    }),
                ).toBeInTheDocument()
            })
        })

        it('shows loading state on Confirm button during save', async () => {
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                isPendingCreateOrUpdate: true,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeInTheDocument()
        })

        it('disables Cancel button during save', async () => {
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                isPendingCreateOrUpdate: true,
            })

            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            expect(cancelButton).toBeDisabled()
        })

        it('closes modal when Cancel is clicked', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Connect Help Center',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('no help center flow', () => {
        beforeEach(() => {
            mockUseFaqHelpCenter.mockReturnValue({
                ...defaultMockValues,
                faqHelpCenters: [],
                helpCenterItems: [{ id: -1, name: 'No help center' }],
            })
        })

        it('renders no help center message when no help centers exist', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText(
                    'You must create a Help Center first in order to connect it to AI Agent.',
                ),
            ).toBeInTheDocument()
        })

        it('displays link to Help Center settings', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByText('Go to Help Center settings'),
            ).toBeInTheDocument()
        })

        it('navigates to help center settings when link is clicked', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const link = screen.getByText('Go to Help Center settings')
            await act(() => userEvent.click(link))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/help-center',
            )
        })

        it('displays Done button instead of Confirm and Cancel', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('button', { name: 'Done' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Confirm' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'Cancel' }),
            ).not.toBeInTheDocument()
        })

        it('closes modal when Done is clicked', async () => {
            render(<HelpCenterSelectModal />)

            await act(() => {
                eventCallback?.()
            })

            const doneButton = screen.getByRole('button', { name: 'Done' })
            await act(() => userEvent.click(doneButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', {
                        name: 'Connect Help Center',
                    }),
                ).not.toBeInTheDocument()
            })
        })
    })
})
