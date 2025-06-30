import { render, screen } from '@testing-library/react'

import TimeInputField from '../TimeInputField'

describe('TimeInputField', () => {
    it('should render', () => {
        render(<TimeInputField label="timeInput" />)

        const input = screen.getByLabelText('timeInput')

        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'time')
        expect(input).toHaveAttribute('pattern', '[0-9][0-9]:[0-9][0-9]')
    })
})
