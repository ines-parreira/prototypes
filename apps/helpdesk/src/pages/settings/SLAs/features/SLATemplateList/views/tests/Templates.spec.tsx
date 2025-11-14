import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { TEMPLATES_LIST } from 'pages/settings/SLAs/config/templates'

import Templates from '../Templates'

describe('<Templates />', () => {
    it('should display the templates', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Templates templates={TEMPLATES_LIST} />
            </MemoryRouter>,
        )

        expect(getByText(TEMPLATES_LIST[0].name)).toBeInTheDocument()
        expect(getByText(TEMPLATES_LIST[1].name)).toBeInTheDocument()
        expect(getByText(/Create SLA/i)).toBeInTheDocument()
    })

    it('should display a `See All Templates` button link', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Templates templates={TEMPLATES_LIST} showSeeAllTemplates />
            </MemoryRouter>,
        )

        expect(getByText(/See All Templates/i)).toBeInTheDocument()
    })
})
