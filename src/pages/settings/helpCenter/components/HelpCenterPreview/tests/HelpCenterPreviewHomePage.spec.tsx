import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {HelpCenterLayout} from 'pages/settings/helpCenter/types/layout.enum'
import HelpCenterPreviewHomePage from '../HelpCenterPreviewHomePage'

const renderComponent = (
    props: ComponentProps<typeof HelpCenterPreviewHomePage>
) => {
    render(<HelpCenterPreviewHomePage {...props} />)
}

describe('<HelpCenterPreviewHomePage />', () => {
    it('should render preview of help center default layout', () => {
        renderComponent({
            layout: HelpCenterLayout.DEFAULT,
            searchPlaceholder: 'Search Text',
            isSearchbar: true,
        })

        expect(screen.getByText('Search Text')).toBeInTheDocument()
        expect(screen.getByText('Categories')).toBeInTheDocument()
        expect(screen.getByText('Articles')).toBeInTheDocument()
    })

    it('should render preview of help center 1-page layout', () => {
        renderComponent({
            layout: HelpCenterLayout.ONEPAGER,
        })

        expect(screen.getByText('FAQs')).toBeInTheDocument()
        expect(screen.getByText('Go to category...')).toBeInTheDocument()
        expect(screen.getByText('Shipping & Delivery')).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })
})
