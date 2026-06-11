import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SelectDropdownField } from '../SelectDropdownField'

describe('SelectDropdownField', () => {
    it('should render the select with the selected value', () => {
        render(
            <SelectDropdownField
                options={[]}
                onChange={jest.fn()}
                value={'value'}
            />,
        )

        const combobox = screen.getByRole('combobox')
        expect(combobox).toBeInTheDocument()
        expect(combobox).toHaveTextContent('value')
    })
})
