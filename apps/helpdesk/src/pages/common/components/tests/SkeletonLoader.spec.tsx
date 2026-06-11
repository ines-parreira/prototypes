import React from 'react'

import { render } from '@repo/testing'

import { SkeletonLoader } from '../SkeletonLoader'

describe('<SkeletonLoader />', () => {
    it('should render', () => {
        const { container } = render(<SkeletonLoader />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
