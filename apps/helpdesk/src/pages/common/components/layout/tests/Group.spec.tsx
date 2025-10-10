import React from 'react'

import { render } from '@testing-library/react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Group from '../Group'

describe('<Group />', () => {
    it('should render a group of buttons', () => {
        const { container } = render(
            <Group>
                <Button>Foo</Button>
                <Button>Bar</Button>
                <Button>Baz</Button>
            </Group>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
