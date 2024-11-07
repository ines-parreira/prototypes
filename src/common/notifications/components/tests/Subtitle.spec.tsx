import {render} from '@testing-library/react'
import React from 'react'

import Subtitle from '../Subtitle'

describe('Subtitle', () => {
    it('should render given children', () => {
        const {getByText} = render(<Subtitle>Beep-boop</Subtitle>)

        expect(getByText('Beep-boop')).toBeInTheDocument()
    })
})
