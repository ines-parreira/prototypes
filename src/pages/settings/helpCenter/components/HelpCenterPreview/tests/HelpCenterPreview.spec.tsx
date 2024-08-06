import React from 'react'

import {render, screen} from '@testing-library/react'
import HelpCenterPreview from '../HelpCenterPreview'

describe('<HelpCenterPreview />', () => {
    it('should render the help center preview with the name as well as its children', () => {
        render(
            <HelpCenterPreview name="Help Center Name">
                <div>Children</div>
            </HelpCenterPreview>
        )
        expect(screen.getByText('Help Center Name')).toBeInTheDocument()
        expect(screen.getByText('Children')).toBeInTheDocument()
    })

    it('should render the help center preview with the logo as well as its children', () => {
        render(
            <HelpCenterPreview logoUrl="logo.png">
                <div>Children</div>
            </HelpCenterPreview>
        )
        expect(screen.getByAltText('Help Center Logo')).toBeInTheDocument()
        expect(screen.getByText('Children')).toBeInTheDocument()
    })

    it('should not render name or logo if both are not provided', () => {
        render(<HelpCenterPreview>Children</HelpCenterPreview>)
        expect(screen.queryByText('Help Center Name')).not.toBeInTheDocument()
        expect(
            screen.queryByAltText('Help Center Logo')
        ).not.toBeInTheDocument()
        expect(screen.getByText('Children')).toBeInTheDocument()
    })
})
