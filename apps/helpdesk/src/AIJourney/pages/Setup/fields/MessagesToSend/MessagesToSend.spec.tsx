import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { MessagesToSendField } from './MessagesToSend'

describe('<MessagesToSendField />', () => {
    it('should accept default value', () => {
        render(<MessagesToSendField value={2} />)

        const options = screen.getAllByRole('button')

        options.forEach((option) => {
            if (option.textContent !== '2') {
                expect(option).toHaveClass('selectorOption')
            } else {
                expect(option).toHaveClass('selectorOption--selected')
            }
        })
    })
    it('should render field information and info', async () => {
        render(<MessagesToSendField />)
        expect(
            screen.getByText('Total number of messages to send'),
        ).toBeInTheDocument()
        const user = userEvent.setup()

        await act(async () => {
            await user.hover(screen.getByText('info'))
        })

        expect(
            screen.getByText(
                'First message and all follow-up messages which will be sent every 24 hours.',
            ),
        ).toBeInTheDocument()
    })
    it('should trigger onChange', async () => {
        const onChange = jest.fn()
        render(<MessagesToSendField value={2} onChange={onChange} />)

        const user = userEvent.setup()
        const option = screen.getByRole('button', {
            name: '3',
        })
        await act(async () => {
            await user.click(option)
        })
        expect(onChange).toHaveBeenCalledWith(3)
    })
})
