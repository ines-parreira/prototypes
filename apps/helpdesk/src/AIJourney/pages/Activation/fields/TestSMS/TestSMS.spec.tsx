import { render, screen } from '@testing-library/react'

import { TestSMSField } from './TestSMS'

describe('<TestSMSField />', () => {
    it('should accept default value', () => {
        render(<TestSMSField value={'10'} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveValue('10')
    })
    it('should render field information and info', () => {
        render(<TestSMSField />)
        expect(screen.getByText('Enter your phone number')).toBeInTheDocument()
    })
})
