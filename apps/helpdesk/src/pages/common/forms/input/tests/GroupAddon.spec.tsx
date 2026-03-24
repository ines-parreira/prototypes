import React from 'react'

import { reportError } from '@repo/logging'
import { render } from '@testing-library/react'

import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import GroupAddon from '../GroupAddon'

jest.mock('@repo/logging')
const reportErrorMock = reportError as jest.Mock

describe('<GroupAddon />', () => {
    it('should render an GroupAddon inside a group input wrapper', () => {
        const { container } = render(
            <InputGroup>
                <TextInput onChange={() => null} />
                <GroupAddon>.postfix</GroupAddon>
            </InputGroup>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should report an error when using GroupAddon outside an InputGroup', () => {
        render(<GroupAddon>.postfix</GroupAddon>)
        expect(reportErrorMock).toHaveBeenCalledTimes(1)
        expect(reportErrorMock).toHaveBeenCalledWith(
            new Error('GroupAddon must be inside an InputGroup'),
        )
    })
})
