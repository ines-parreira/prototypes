import {render} from '@testing-library/react'
import React from 'react'

import Skeleton from './Skeleton'

describe('<Skeleton />', () => {
    it('should render a skeleton', () => {
        const {container} = render(<Skeleton />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
