import React from 'react'

import { render } from '@repo/testing'

import AppSetupStep from '../AppSetupStep'

describe('<AppSetupStep />', () => {
    it('should render the component', () => {
        const { getByText } = render(<AppSetupStep />)

        expect(getByText('Have your mobile device ready')).toBeInTheDocument()
        expect(getByText('Google Authenticator')).toBeInTheDocument()
    })
})
