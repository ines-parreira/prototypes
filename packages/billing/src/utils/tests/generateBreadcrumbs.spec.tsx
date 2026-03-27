import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { generateBreadcrumbs } from '../generateBreadcrumbs'

describe('generateBreadcrumbs', () => {
    it('should render a billing breadcrumb trail', () => {
        const breadcrumbItems = ['Page 1', <div key="2">Page 2</div>, 'Page 3']
        render(
            <MemoryRouter>
                <div>{generateBreadcrumbs(breadcrumbItems)}</div>
            </MemoryRouter>,
        )

        screen.getByText('Page 1')
        screen.getByText('Page 2')
        screen.getByText('Page 3')
        expect(
            screen.getByRole('link', { name: 'Billing' }).getAttribute('href'),
        ).toBe('/app/settings/billing')
    })
})
