import {render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import RadioButtonField from '../RadioButtonField'
import RadioFieldSet from '../RadioFieldSet'

jest.mock('pages/common/forms/RadioFieldSet', () => jest.fn(() => null))

const RadioFieldSetMock = assumeMock(RadioFieldSet)

describe('<RadioButtonField />', () => {
    it('should pass the correct props to the ToggleInput component', () => {
        const onChange = jest.fn()
        const option = {
            value: '1',
            label: 'test',
        }
        render(
            <RadioButtonField
                value="test-value"
                className="test-class"
                onChange={onChange}
                options={[option]}
            />
        )

        expect(RadioFieldSetMock).toHaveBeenCalledWith(
            {
                selectedValue: 'test-value',
                className: 'test-class',
                onChange,
                options: [option],
            },
            {}
        )
    })
})
