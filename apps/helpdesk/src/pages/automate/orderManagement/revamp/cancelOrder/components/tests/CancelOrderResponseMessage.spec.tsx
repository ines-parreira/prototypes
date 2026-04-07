import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CancelOrderResponseMessage } from '../CancelOrderResponseMessage'

describe('<CancelOrderResponseMessage />', () => {
    const defaultProps = {
        responseMessageContent: { html: '', text: '' },
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the label and caption', () => {
        render(<CancelOrderResponseMessage {...defaultProps} />)

        expect(
            screen.getByLabelText('Response for unfulfilled orders'),
        ).toBeInTheDocument()
        expect(screen.getByText(/automated reply is sent/i)).toBeInTheDocument()
    })

    it('should display existing response message text', () => {
        render(
            <CancelOrderResponseMessage
                {...defaultProps}
                responseMessageContent={{
                    html: '<div>Hello</div>',
                    text: 'Hello',
                }}
            />,
        )

        expect(
            screen.getByLabelText('Response for unfulfilled orders'),
        ).toHaveValue('Hello')
    })

    it('should call onChange with html-wrapped value when typing', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()

        render(
            <CancelOrderResponseMessage
                responseMessageContent={{ html: '', text: '' }}
                onChange={onChange}
            />,
        )

        await user.type(
            screen.getByLabelText('Response for unfulfilled orders'),
            'a',
        )

        expect(onChange).toHaveBeenCalledWith({
            html: '<div>a</div>',
            text: 'a',
        })
    })
})
