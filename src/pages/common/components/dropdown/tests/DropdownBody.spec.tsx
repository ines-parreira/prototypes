import React from 'react'
import {render} from '@testing-library/react'

import DropdownBody from '../DropdownBody'

describe('<DropdownBody />', () => {
    it('should render', () => {
        const {container} = render(<DropdownBody>Bar</DropdownBody>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when loading', () => {
        const {container} = render(<DropdownBody isLoading>Bar</DropdownBody>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
