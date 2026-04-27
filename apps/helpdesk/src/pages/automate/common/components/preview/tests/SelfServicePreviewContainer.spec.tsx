import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import SelfServicePreviewContainer from '../SelfServicePreviewContainer'

describe('<SelfServicePreviewChannelSelect />', () => {
    it('should render component', () => {
        render(
            <SelfServicePreviewContainer onChange={jest.fn()} channels={[]}>
                {() => <div></div>}
            </SelfServicePreviewContainer>,
        )
        expect(screen.getByText('Channel')).toBeInTheDocument()
    })
})
