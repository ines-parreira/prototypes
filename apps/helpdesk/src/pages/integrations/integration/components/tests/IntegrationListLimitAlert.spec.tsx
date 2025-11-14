import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import IntegrationListLimitAlert from '../IntegrationListLimitAlert'

describe('<IntegrationListLimitAlert/>', () => {
    it('should not render', () => {
        const { container } = render(
            <MemoryRouter>
                <IntegrationListLimitAlert
                    totalIntegrations={0}
                    maxIntegrations={2}
                />
            </MemoryRouter>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a warning message', () => {
        const { container } = render(
            <MemoryRouter>
                <IntegrationListLimitAlert
                    totalIntegrations={1}
                    maxIntegrations={2}
                />
            </MemoryRouter>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an error message', () => {
        const { container } = render(
            <MemoryRouter>
                <IntegrationListLimitAlert
                    totalIntegrations={2}
                    maxIntegrations={2}
                />
            </MemoryRouter>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
