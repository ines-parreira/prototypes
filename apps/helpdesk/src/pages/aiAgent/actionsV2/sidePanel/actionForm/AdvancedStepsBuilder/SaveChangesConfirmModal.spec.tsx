import { render, userEvent } from '@repo/testing'

import { SaveChangesConfirmModal } from './SaveChangesConfirmModal'

describe('SaveChangesConfirmModal', () => {
    it('renders the prompt copy when open', () => {
        const { getByRole, getByText } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={() => {}}
                onDiscard={() => {}}
                onSave={() => {}}
            />,
        )
        expect(
            getByRole('heading', { name: /save changes\?/i }),
        ).toBeInTheDocument()
        expect(
            getByText(/you have unsaved changes to this advanced action/i),
        ).toBeInTheDocument()
    })

    it('renders nothing when closed', () => {
        const { queryByRole } = render(
            <SaveChangesConfirmModal
                isOpen={false}
                onOpenChange={() => {}}
                onDiscard={() => {}}
                onSave={() => {}}
            />,
        )
        expect(
            queryByRole('heading', { name: /save changes\?/i }),
        ).not.toBeInTheDocument()
    })

    it('closes the modal via onOpenChange when Cancel is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const { getAllByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onDiscard={() => {}}
                onSave={() => {}}
            />,
        )
        // OverlayFooter renders its own Cancel button before our explicit one;
        // the explicit button is the second match and is the one wired up here.
        const cancelButtons = getAllByRole('button', { name: /cancel/i })
        await user.click(cancelButtons[cancelButtons.length - 1])
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('invokes onDiscard when Discard changes is clicked', async () => {
        const user = userEvent.setup()
        const onDiscard = jest.fn()
        const { getByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={() => {}}
                onDiscard={onDiscard}
                onSave={() => {}}
            />,
        )
        await user.click(getByRole('button', { name: /discard changes/i }))
        expect(onDiscard).toHaveBeenCalledTimes(1)
    })

    it('invokes onSave when Save changes is clicked', async () => {
        const user = userEvent.setup()
        const onSave = jest.fn()
        const { getByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={() => {}}
                onDiscard={() => {}}
                onSave={onSave}
            />,
        )
        await user.click(getByRole('button', { name: /save changes/i }))
        expect(onSave).toHaveBeenCalledTimes(1)
    })
})
