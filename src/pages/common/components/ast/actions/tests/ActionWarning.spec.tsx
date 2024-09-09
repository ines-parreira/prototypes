import React from 'react'
import {render, screen} from '@testing-library/react'

import ActionWarning from '../ActionWarning'

describe('<ActionWarning />', () => {
    it('should render a warning', () => {
        render(<ActionWarning>Foo bar</ActionWarning>)

        expect(screen.getByText('Foo bar')).toBeInTheDocument()
    })
})
