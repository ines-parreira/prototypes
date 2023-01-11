import React from 'react'
import {render} from '@testing-library/react'

import SpotlightLoader from '../SpotlightLoader'

describe('<SpotlightLoader />', () => {
    it('should render', () => {
        const {container} = render(<SpotlightLoader />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
