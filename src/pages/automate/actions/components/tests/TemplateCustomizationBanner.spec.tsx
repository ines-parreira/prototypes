import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import TemplateCustomizationBanner from '../TemplateCustomizationBanner'

describe('<TemplateCustomizationBanner/>', () => {
    it('should render banner and hide when closed', () => {
        render(<TemplateCustomizationBanner />)

        expect(screen.getByText(/this action works/i)).toBeInTheDocument()
        fireEvent.click(screen.getByAltText('close-icon'))
        expect(screen.queryByText(/this action works/i)).toBeNull()
    })
})
