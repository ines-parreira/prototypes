import React from 'react'

import { render, screen } from '@testing-library/react'

import UncontrolledSelfServicePreviewContainer from '../UncontrolledSelfServicePreviewContainer'

describe('<UncontrolledSelfServicePreviewContainer />', () => {
    it('should render component', () => {
        render(
            <UncontrolledSelfServicePreviewContainer channels={[]}>
                {() => <div></div>}
            </UncontrolledSelfServicePreviewContainer>,
        )
        expect(screen.getByText('Channel')).toBeInTheDocument()
    })
})
