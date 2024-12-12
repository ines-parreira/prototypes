import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import RequirementTypeInput from '../RequirementTypeInput'

describe('<RequirementTypeInput/>', () => {
    it('should trigger events on change', () => {
        const onChange = jest.fn()
        render(<RequirementTypeInput value="visible" onChange={onChange} />)

        userEvent.click(
            screen.getByLabelText('Always required', {selector: 'input'})
        )

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('required')
    })
})
