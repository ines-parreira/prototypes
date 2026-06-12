import React from 'react'

import { render } from '@repo/testing'
import { Button } from '@gorgias/axiom'
import { noop } from '@gorgias/toolkit'

import { DefaultExportNumberInput as NumberInput } from 'pages/common/forms/input/NumberInput'

import { InputGroup } from '../InputGroup'

describe('<InputGroup />', () => {
    it('should render a group input wrapper', () => {
        const { container } = render(
            <InputGroup>
                <Button variant="secondary">Foo</Button>
                <NumberInput onChange={noop} />
                <Button variant="secondary">Bar</Button>
                <Button variant="secondary">Baz</Button>
            </InputGroup>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
