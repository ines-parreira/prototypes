import React from 'react'
import {render, screen} from '@testing-library/react'

import Label from '../Label'

describe('<Label />', () => {
    it('should render correctly', () => {
        const content = <input name="test" defaultValue="yeaboy" />

        const {rerender, container} = render(
            <Label label="My label">{content}</Label>
        )
        expect(container.firstChild).toMatchSnapshot()
        rerender(
            <Label label="My labe" isRequired>
                {content}
            </Label>
        )
        expect(screen.getByText('*'))
    })
})
