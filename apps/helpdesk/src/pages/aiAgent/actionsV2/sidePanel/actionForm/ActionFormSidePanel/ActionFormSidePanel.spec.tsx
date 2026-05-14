import { render, userEvent } from '@repo/testing'

import { ActionFormSidePanel } from './ActionFormSidePanel'

const renderPanel = (
    props: Partial<React.ComponentProps<typeof ActionFormSidePanel>> = {},
) =>
    render(
        <ActionFormSidePanel
            isOpen
            onOpenChange={() => {}}
            title="Configure action"
            {...props}
        >
            <div>Form body</div>
        </ActionFormSidePanel>,
    )

describe('ActionFormSidePanel', () => {
    it('renders the title and children when open', () => {
        const { getByRole, getByText } = renderPanel({
            description: 'Pick a store and add steps',
        })
        expect(
            getByRole('heading', { name: /configure action/i }),
        ).toBeInTheDocument()
        expect(getByText(/pick a store and add steps/i)).toBeInTheDocument()
        expect(getByText('Form body')).toBeInTheDocument()
    })

    it('does not render the panel body when closed', () => {
        const { queryByText } = renderPanel({ isOpen: false })
        expect(queryByText('Form body')).not.toBeInTheDocument()
        expect(queryByText('Configure action')).not.toBeInTheDocument()
    })

    it('triggers onSubmit when the primary footer button is clicked', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        const { getByRole } = renderPanel({ onSubmit })
        await user.click(getByRole('button', { name: /save and enable/i }))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('triggers onDismiss when the dismiss footer button is clicked', async () => {
        const user = userEvent.setup()
        const onDismiss = jest.fn()
        const { getByRole } = renderPanel({
            onDismiss,
            onSubmit: () => {},
        })
        await user.click(getByRole('button', { name: /dismiss/i }))
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('honors custom submit and dismiss labels', () => {
        const { getByRole } = renderPanel({
            onSubmit: () => {},
            onDismiss: () => {},
            submitLabel: 'Apply',
            dismissLabel: 'Cancel',
        })
        expect(getByRole('button', { name: /apply/i })).toBeInTheDocument()
        expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('disables the submit button when isSubmitDisabled is true', () => {
        const { getByRole } = renderPanel({
            onSubmit: () => {},
            isSubmitDisabled: true,
        })
        expect(getByRole('button', { name: /save and enable/i })).toBeDisabled()
    })

    it('disables the dismiss button while submitting', () => {
        const { getByRole } = renderPanel({
            onSubmit: () => {},
            onDismiss: () => {},
            isSubmitting: true,
        })
        expect(getByRole('button', { name: /dismiss/i })).toBeDisabled()
    })

    it('does not call onSubmit while submitting', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        const { getByRole } = renderPanel({ onSubmit, isSubmitting: true })
        await user.click(getByRole('button', { name: /save and enable/i }))
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
