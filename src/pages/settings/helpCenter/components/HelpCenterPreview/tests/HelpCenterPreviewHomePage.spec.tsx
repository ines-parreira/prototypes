import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import HelpCenterPreviewHomePage from '../HelpCenterPreviewHomePage'

const renderComponent = (
    props: ComponentProps<typeof HelpCenterPreviewHomePage>
) => {
    render(<HelpCenterPreviewHomePage {...props} />)
}

describe('<HelpCenterPreviewHomePage />', () => {
    it('should render component with article and categories', () => {
        renderComponent({})

        expect(screen.getByText('Articles')).toBeInTheDocument()
        expect(screen.getByText('Categories')).toBeInTheDocument()
    })

    it('should render with search bar', () => {
        renderComponent({searchPlaceholder: 'Search Text', isSearchbar: true})

        expect(screen.getByText('Search Text')).toBeInTheDocument()
    })
})
