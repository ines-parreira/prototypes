import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { MessageWithDiscountCodeField } from './MessageWithDiscountCode'

describe('<MessageWithDiscountCodeField />', () => {
    it('should select value', () => {
        render(<MessageWithDiscountCodeField numberOfMessages={4} value={2} />)

        expect(
            screen.getByRole('button', {
                name: '2',
            }),
        ).toHaveClass('selectorOption--selected')
        expect(
            screen.getByRole('button', {
                name: '1',
            }),
        ).toHaveClass('selectorOption')
        expect(
            screen.getByRole('button', {
                name: '3',
            }),
        ).toHaveClass('selectorOption')
        expect(
            screen.getByRole('button', {
                name: '4',
            }),
        ).toHaveClass('selectorOption')
    })

    it('should render field information and info', () => {
        render(<MessageWithDiscountCodeField numberOfMessages={2} value={2} />)
        expect(
            screen.getByText('Select message that includes discount code'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'When should the discount code be introduced by the agent',
            ),
        ).toBeInTheDocument()
    })

    it('should trigger onChange', async () => {
        const onChange = jest.fn()
        render(
            <MessageWithDiscountCodeField
                numberOfMessages={2}
                value={2}
                onChange={onChange}
            />,
        )

        const user = userEvent.setup()
        const option = screen.getByRole('button', {
            name: '1',
        })
        await act(async () => {
            await user.click(option)
        })
        expect(onChange).toHaveBeenCalledWith(1)
    })
})
