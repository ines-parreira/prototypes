import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { SaveChangesConfirmModal } from './SaveChangesConfirmModal'

describe('SaveChangesConfirmModal', () => {
    it('does not render its body when closed', () => {
        const { queryByText } = render(
            <SaveChangesConfirmModal
                isOpen={false}
                onOpenChange={() => {}}
                onDiscard={() => {}}
                onSave={() => {}}
            />,
        )
        expect(queryByText('Save changes?')).not.toBeInTheDocument()
    })

    it('triggers onSave and closes when Save Changes is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onSave = jest.fn()
        const { getByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onDiscard={() => {}}
                onSave={onSave}
            />,
        )
        await user.click(getByRole('button', { name: /save changes/i }))
        expect(onSave).toHaveBeenCalled()
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('triggers onDiscard and closes when Discard Changes is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onDiscard = jest.fn()
        const { getByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onDiscard={onDiscard}
                onSave={() => {}}
            />,
        )
        await user.click(getByRole('button', { name: /discard changes/i }))
        expect(onDiscard).toHaveBeenCalled()
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes the modal without side effects when Back To Editing is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onDiscard = jest.fn()
        const onSave = jest.fn()
        const { getByRole } = render(
            <SaveChangesConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onDiscard={onDiscard}
                onSave={onSave}
            />,
        )
        await user.click(getByRole('button', { name: /back to editing/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(onDiscard).not.toHaveBeenCalled()
        expect(onSave).not.toHaveBeenCalled()
    })
})
