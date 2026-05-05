import React from 'react'

import { render } from '@repo/testing'

import AutoQASkeleton from '../AutoQASkeleton'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div> Skeleton</div>,
}))

describe('AutoQASkeleton', () => {
    it('should render 3 skeletons', () => {
        const { getAllByText } = render(<AutoQASkeleton />)
        const els = getAllByText('Skeleton')
        expect(els.length).toBe(3)
    })
})
