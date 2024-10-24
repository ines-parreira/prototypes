import {render} from '@testing-library/react'
import React from 'react'

import IconButton from '../IconButton'

describe('<IconButton />', () => {
    it('should render a button containing an icon', () => {
        const {container} = render(<IconButton>check</IconButton>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
