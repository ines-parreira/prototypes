import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import RequirementTypeInput from '../RequirementTypeInput'

describe('<RequirementTypeInput/>', () => {
    it('should trigger events on change', () => {
        const onChange = jest.fn()
        renderWithRouter(
            <RequirementTypeInput value="visible" onChange={onChange} />,
        )

        userEvent.click(
            screen.getByLabelText('Always required', { selector: 'input' }),
        )

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('required')
    })
})
