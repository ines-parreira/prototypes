import React from 'react'

import { render } from '@testing-library/react'

import DropdownButton from '../DropdownButton'

describe('<DropdownButton />', () => {
    it('should render a button with dropdown', () => {
        const { container } = render(
            <DropdownButton onToggleClick={jest.fn()}>Click</DropdownButton>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
