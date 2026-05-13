import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { ConfirmationToggle } from './ConfirmationToggle'

describe('ConfirmationToggle', () => {
    it('renders the default label and description', () => {
        const { getByText } = render(
            <ConfirmationToggle isEnabled={false} onToggle={() => {}} />,
        )
        expect(getByText('Customer confirmation')).toBeInTheDocument()
        expect(
            getByText(/Recommended for irreversible actions/),
        ).toBeInTheDocument()
    })

    it('forwards the toggle change', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()
        const { getByLabelText } = render(
            <ConfirmationToggle isEnabled={false} onToggle={onToggle} />,
        )
        await user.click(getByLabelText('Customer confirmation'))
        expect(onToggle).toHaveBeenCalledWith(true)
    })
})
