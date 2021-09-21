import React from 'react'
import {render} from '@testing-library/react'

import {DropText} from '../DropText'

describe('<DropText>', () => {
    it('matches snapshot', () => {
        const {container} = render(<DropText />)
        expect(container).toMatchSnapshot()
    })
})
