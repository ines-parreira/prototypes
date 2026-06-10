import React from 'react'

import { render } from '@repo/testing'

import AutoQASkeleton from '../AutoQASkeleton'

describe('AutoQASkeleton', () => {
    it('should render 3 skeletons', () => {
        const { getAllByLabelText } = render(<AutoQASkeleton />)
        expect(getAllByLabelText('Loading')).toHaveLength(3)
    })
})
