import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { AdvancedActionConfirmModal } from './AdvancedActionConfirmModal'

describe('AdvancedActionConfirmModal', () => {
    it('does not render its body when closed', () => {
        const { queryByText } = render(
            <AdvancedActionConfirmModal
                isOpen={false}
                onOpenChange={() => {}}
                onConfirm={() => {}}
            />,
        )
        expect(
            queryByText('Advanced options for Actions'),
        ).not.toBeInTheDocument()
    })

    it('shows the learn more link when an href is supplied', () => {
        const { getByRole } = render(
            <AdvancedActionConfirmModal
                isOpen
                onOpenChange={() => {}}
                onConfirm={() => {}}
                learnMoreHref="https://help.example.com/actions"
            />,
        )
        const link = getByRole('link', {
            name: /learn more about advanced options/i,
        })
        expect(link).toHaveAttribute('href', 'https://help.example.com/actions')
    })

    it('hides the learn more link when no href is supplied', () => {
        const { queryByRole } = render(
            <AdvancedActionConfirmModal
                isOpen
                onOpenChange={() => {}}
                onConfirm={() => {}}
            />,
        )
        expect(
            queryByRole('link', {
                name: /learn more about advanced options/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('invokes onConfirm and closes on Convert To Advanced View', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onConfirm = jest.fn()
        const { getByRole } = render(
            <AdvancedActionConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
            />,
        )
        await user.click(
            getByRole('button', { name: /convert to advanced view/i }),
        )
        expect(onConfirm).toHaveBeenCalled()
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes without confirming when Back To Editing is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onConfirm = jest.fn()
        const { getByRole } = render(
            <AdvancedActionConfirmModal
                isOpen
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
            />,
        )
        await user.click(getByRole('button', { name: /back to editing/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(onConfirm).not.toHaveBeenCalled()
    })
})
