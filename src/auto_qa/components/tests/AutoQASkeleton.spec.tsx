import {render} from '@testing-library/react'
import React from 'react'

import AutoQASkeleton from '../AutoQASkeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div>Skeleton</div>
))

describe('AutoQASkeleton', () => {
    it('should render 3 skeletons', () => {
        const {getAllByText} = render(<AutoQASkeleton />)
        const els = getAllByText('Skeleton')
        expect(els.length).toBe(3)
    })
})
