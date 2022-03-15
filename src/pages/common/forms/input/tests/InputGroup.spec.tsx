import {render} from '@testing-library/react'
import React from 'react'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'
import NumberInput from 'pages/common/forms/input/NumberInput'

import InputGroup from '../InputGroup'

describe('<InputGroup />', () => {
    it('should render a group input wrapper', () => {
        const {container} = render(
            <InputGroup>
                <Button intent="secondary">Foo</Button>
                <NumberInput onChange={_noop} />
                <Button intent="secondary">Bar</Button>
                <Button intent="secondary">Baz</Button>
            </InputGroup>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
