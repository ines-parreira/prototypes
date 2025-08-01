import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import ToggleInput from 'pages/common/forms/ToggleInput'

import ToggleInputField from '../ToggleInputField'

jest.mock('pages/common/forms/ToggleInput', () => jest.fn(() => null))

const ToggleInputMock = assumeMock(ToggleInput)

describe('<ToggleInputField />', () => {
    it('should pass the correct props to the ToggleInput component', () => {
        const onChange = jest.fn()
        render(
            <ToggleInputField
                value={true}
                onChange={onChange}
                className="test-class"
            />,
        )

        expect(ToggleInputMock).toHaveBeenCalledWith(
            {
                isToggled: true,
                className: 'test-class',
                onClick: onChange,
                value: undefined,
            },
            {},
        )
    })
})
