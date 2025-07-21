import React from 'react'

import { render } from '@testing-library/react'

import AutoQASkeleton from '../AutoQASkeleton'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div> Skeleton</div>,
}))

describe('AutoQASkeleton', () => {
    it('should render 3 skeletons', () => {
        const { getAllByText } = render(<AutoQASkeleton />)
        const els = getAllByText('Skeleton')
        expect(els.length).toBe(3)
    })
})
