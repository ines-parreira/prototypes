import React from 'react'
import {render} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import EmailIntegrationOnboarding from '../EmailIntegrationOnboarding'

const renderComponent = () =>
    render(
        <MemoryRouter>
            <EmailIntegrationOnboarding />
        </MemoryRouter>
    )

describe('<EmailIntegrationCreate />', () => {
    it('should render', () => {
        const {container, getByText} = renderComponent()
        expect(container).toBeInTheDocument()
        expect(getByText('ConnectIntegration')).toBeInTheDocument()
    })
})
