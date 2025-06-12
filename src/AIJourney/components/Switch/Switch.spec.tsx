import { cleanup, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Switch } from './Switch'

describe('<Switch />', () => {
    it('should accept default value', () => {
        render(<Switch isChecked={true} />)

        let checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toBeChecked()

        cleanup()

        render(<Switch isChecked={false} />)
        checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
    })
    it('should call onChange', async () => {
        const onChangeMock = jest.fn()
        render(<Switch onChange={onChangeMock} isChecked={true} />)

        let checkbox = screen.getByRole('checkbox')
        await userEvent.click(checkbox)
        expect(checkbox).toBeChecked()

        expect(onChangeMock).toHaveBeenCalledTimes(1)
        await userEvent.click(checkbox)
        expect(onChangeMock).toHaveBeenCalledTimes(2)
    })
})
