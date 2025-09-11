import { useState } from 'react'

import { cleanup, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { EnableDiscountField } from './EnableDiscount'

function EnableDiscountFieldWrapper({ onChange }: { onChange?: jest.Mock }) {
    const [enabled, setEnabled] = useState(true)

    const handleOnChange = () => {
        onChange?.()
        setEnabled((prev) => !prev)
    }

    return <EnableDiscountField isEnabled={enabled} onChange={handleOnChange} />
}

describe('<EnableDiscountField />', () => {
    it('should accept default value', () => {
        render(<EnableDiscountField isEnabled={true} onChange={jest.fn()} />)

        expect(screen.getByText('Include a discount code')).toBeInTheDocument()

        let checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toBeChecked()

        cleanup()

        render(<EnableDiscountField isEnabled={false} onChange={jest.fn()} />)
        checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
    })
    it('should call onChange and update checked state', async () => {
        const onChangeMock = jest.fn()

        render(<EnableDiscountFieldWrapper onChange={onChangeMock} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()

        await userEvent.click(checkbox)
        expect(checkbox).not.toBeChecked()

        await userEvent.click(checkbox)
        expect(checkbox).toBeChecked()
    })
})
