import React from 'react'
import {render} from '@testing-library/react'
import EmailIntegrationOnboarding from '../EmailIntegrationOnboarding'

describe('<EmailIntegrationCreate />', () => {
    it('should render', () => {
        const {container} = render(<EmailIntegrationOnboarding />)
        expect(container).toBeInTheDocument()
    })
})
