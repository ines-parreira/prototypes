import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import TemplateListView from '../TemplateListView'

const mockTemplates = 'MockTemplates'

jest.mock('../Templates', () => jest.fn(() => <div>{mockTemplates}</div>))

describe('<TemplateListView />', () => {
    it('should display the navigation links in header', () => {
        const { getByText } = render(
            <MemoryRouter>
                <TemplateListView />
            </MemoryRouter>,
        )

        expect(getByText('SLAs')).toBeInTheDocument()
        expect(getByText(/SLAs Templates/i)).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: /Create SLA/i,
            }),
        ).toBeInTheDocument()
    })

    it('should display the list of templates', () => {
        const { getByText } = render(
            <MemoryRouter>
                <TemplateListView />
            </MemoryRouter>,
        )

        expect(getByText(/Start with an SLA template/i)).toBeInTheDocument()
        expect(getByText(mockTemplates)).toBeInTheDocument()
    })
})
