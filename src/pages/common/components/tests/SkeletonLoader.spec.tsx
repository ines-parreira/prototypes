import {render} from '@testing-library/react'
import React from 'react'

import SkeletonLoader from '../SkeletonLoader'

describe('<SkeletonLoader />', () => {
    it('should render', () => {
        const {container} = render(<SkeletonLoader />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
