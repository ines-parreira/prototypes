import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { user as currentUser } from 'fixtures/users'
import {
    CancellationPrimaryReasonLabel,
    CancellationSecondaryReasonLabel,
} from 'pages/settings/new_billing/components/CancelProductModal/constants'

import { GatedCancellationModal } from '../GatedCancellationModal'

const storeState = {
    currentUser: fromJS(currentUser),
}

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    bookACallUrl: 'https://calendly.com/gorgias/csm-call',
}

describe('GatedCancellationModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the title and user email', () => {
        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        expect(
            screen.getByText('Tell us more about your cancellation request'),
        ).toBeInTheDocument()
        expect(screen.getByText(currentUser.email)).toBeInTheDocument()
    })

    it('should render the cancellation reason select', () => {
        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        expect(
            screen.getByRole('button', { name: /cancellation reason/i }),
        ).toBeInTheDocument()
    })

    const selectPrimaryReason = async (
        user: ReturnType<typeof userEvent.setup>,
        label: CancellationPrimaryReasonLabel,
    ) => {
        await user.click(
            screen.getByRole('button', { name: /cancellation reason/i }),
        )
        const listbox = await screen.findByRole('listbox')
        await user.click(within(listbox).getByText(label))
    }

    it('should disable Submit button until primary and secondary reasons are selected', async () => {
        const user = userEvent.setup()
        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )

        await selectPrimaryReason(user, CancellationPrimaryReasonLabel.Pricing)

        expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
    })

    it('should enable Submit once primary and secondary reasons are both selected', async () => {
        const user = userEvent.setup()
        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        await selectPrimaryReason(user, CancellationPrimaryReasonLabel.Pricing)

        await user.click(
            screen.getByLabelText(
                CancellationSecondaryReasonLabel.TooExpensive,
            ),
        )

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: 'Submit' }),
            ).not.toHaveAttribute('aria-disabled', 'true'),
        )
    })

    it('should call onSubmit with reasonsState and onClose when Submit is clicked', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        const onClose = jest.fn()
        render(
            <GatedCancellationModal
                {...defaultProps}
                onSubmit={onSubmit}
                onClose={onClose}
            />,
            { storeState },
        )

        await selectPrimaryReason(user, CancellationPrimaryReasonLabel.Pricing)
        await user.click(
            screen.getByLabelText(
                CancellationSecondaryReasonLabel.TooExpensive,
            ),
        )

        await user.click(screen.getByRole('button', { name: 'Submit' }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryReason: {
                    label: CancellationPrimaryReasonLabel.Pricing,
                },
                secondaryReason: {
                    label: CancellationSecondaryReasonLabel.TooExpensive,
                },
                completed: true,
            }),
        )
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should include additionalDetails in onSubmit when filled in', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()

        render(
            <GatedCancellationModal {...defaultProps} onSubmit={onSubmit} />,
            { storeState },
        )

        await selectPrimaryReason(user, CancellationPrimaryReasonLabel.Pricing)
        await user.click(
            screen.getByLabelText(
                CancellationSecondaryReasonLabel.TooExpensive,
            ),
        )
        await user.type(
            screen.getByPlaceholderText(/It didn't work out/i),
            'Too expensive for our budget',
        )

        await user.click(screen.getByRole('button', { name: 'Submit' }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                additionalDetails: {
                    label: 'Too expensive for our budget',
                },
            }),
        )
    })

    it('should render Book a call button when bookACallUrl is provided', () => {
        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        expect(
            screen.getByRole('button', { name: 'Book a call' }),
        ).toBeInTheDocument()
    })

    it('should not render Book a call button when bookACallUrl is null', () => {
        render(
            <GatedCancellationModal {...defaultProps} bookACallUrl={null} />,
            { storeState },
        )

        expect(
            screen.queryByRole('button', { name: 'Book a call' }),
        ).not.toBeInTheDocument()
    })

    it('should open bookACallUrl in a new tab when Book a call is clicked', async () => {
        const openSpy = jest
            .spyOn(window, 'open')
            .mockImplementation(() => null)
        const user = userEvent.setup()

        render(<GatedCancellationModal {...defaultProps} />, { storeState })

        await user.click(screen.getByRole('button', { name: 'Book a call' }))

        expect(openSpy).toHaveBeenCalledWith(
            'https://calendly.com/gorgias/csm-call',
            '_blank',
        )
        openSpy.mockRestore()
    })

    it('should call onClose when the modal is dismissed', async () => {
        const onClose = jest.fn()
        const user = userEvent.setup()

        render(<GatedCancellationModal {...defaultProps} onClose={onClose} />, {
            storeState,
        })

        await user.keyboard('{Escape}')

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    })
})
