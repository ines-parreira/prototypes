import {render, screen} from '@testing-library/react'
import React from 'react'

import MousePointer from '../MousePointer'

describe('<MousePointer />', () => {
    it('should render component', () => {
        render(
            <MousePointer>
                <div>Children</div>
            </MousePointer>
        )
        expect(screen.getByText('Children')).toBeInTheDocument()
    })
})
