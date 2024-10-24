import {render} from '@testing-library/react'
import React from 'react'

import AppSetupStep from '../AppSetupStep'

describe('<AppSetupStep />', () => {
    it('should render the component', () => {
        const {getByText} = render(<AppSetupStep />)

        expect(getByText('Have your mobile device ready')).toBeInTheDocument()
        expect(getByText('Google Authenticator')).toBeInTheDocument()
    })
})
