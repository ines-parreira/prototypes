import React from 'react'
import {render} from '@testing-library/react'

import RequestApp from '../RequestApp'

describe('<RequestApp />', () => {
    it('should render correctly', () => {
        const {container} = render(<RequestApp />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
