import React from 'react'
import {render, screen} from '@testing-library/react'

import Loader from '../Loader'

describe('Loader component', () => {
    it('should render a simple message', () => {
        render(<Loader message={'hello'} />)
        expect(screen.getByText('hello'))
    })
})
