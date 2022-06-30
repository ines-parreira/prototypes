import {render} from '@testing-library/react'
import React from 'react'

import DropdownFooter from '../DropdownFooter'

describe('<DropdownFooter />', () => {
    it('should render', () => {
        const {container} = render(<DropdownFooter>Foo</DropdownFooter>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
