import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { BuildAdvancedModeModal } from './BuildAdvancedModeModal'

describe('BuildAdvancedModeModal', () => {
    it('does not render its body when closed', () => {
        const { queryByText } = render(
            <BuildAdvancedModeModal
                isOpen={false}
                onOpenChange={() => {}}
                onConfirm={() => {}}
            />,
        )
        expect(queryByText('Build with advanced mode')).not.toBeInTheDocument()
    })

    it('renders the title, description, and benefits when open', () => {
        const { getByRole, getByText } = render(
            <BuildAdvancedModeModal
                isOpen
                onOpenChange={() => {}}
                onConfirm={() => {}}
            />,
        )
        expect(
            getByRole('heading', { name: /build with advanced mode/i }),
        ).toBeInTheDocument()
        expect(
            getByText(/switches your action to a visual editor/i),
        ).toBeInTheDocument()
        expect(
            getByText('Connect to apps beyond the App Store'),
        ).toBeInTheDocument()
        expect(
            getByText('Pull in dynamic data to use across steps'),
        ).toBeInTheDocument()
        expect(
            getByText('Add if/then logic to control what happens next'),
        ).toBeInTheDocument()
    })

    it('invokes onConfirm and closes on Build advanced action', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onConfirm = jest.fn()
        const { getByRole } = render(
            <BuildAdvancedModeModal
                isOpen
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
            />,
        )
        await user.click(
            getByRole('button', { name: /build advanced action/i }),
        )
        expect(onConfirm).toHaveBeenCalled()
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes without confirming when Cancel is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        const onConfirm = jest.fn()
        const { getByRole } = render(
            <BuildAdvancedModeModal
                isOpen
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
            />,
        )
        await user.click(getByRole('button', { name: /^cancel$/i }))
        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(onConfirm).not.toHaveBeenCalled()
    })
})
