import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { generateBreadcrumbs } from '../generateBreadcrumbs'

describe('generateBreadcrumbs', () => {
    it('should render a Breadcrumb component with a Billing & usage and additional BreadcrumbItems', () => {
        const breadcrumbItems = ['Page 1', <div key="2">Page 2</div>, 'Page 3']
        const { container } = render(
            <MemoryRouter>
                <div>{generateBreadcrumbs(breadcrumbItems)}</div>
            </MemoryRouter>,
        )

        expect(screen.getByText('Billing')).toBeInTheDocument()
        expect(screen.getByText('Page 1')).toBeInTheDocument()
        expect(screen.getByText('Page 2')).toBeInTheDocument()
        expect(screen.getByText('Page 3')).toBeInTheDocument()

        expect(container).toMatchSnapshot()
    })
})
