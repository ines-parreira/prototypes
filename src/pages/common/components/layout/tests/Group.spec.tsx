import {render} from '@testing-library/react'
import React from 'react'

import Button from 'pages/common/components/button/Button'

import Group from '../Group'

describe('<Group />', () => {
    it('should render a group of buttons', () => {
        const {container} = render(
            <Group>
                <Button>Foo</Button>
                <Button>Bar</Button>
                <Button>Baz</Button>
            </Group>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
