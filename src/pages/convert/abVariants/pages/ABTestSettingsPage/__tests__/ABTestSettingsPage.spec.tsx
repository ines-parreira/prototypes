import React from 'react'
import {render} from '@testing-library/react'

import ABTestSettingPage from '../ABTestSettingsPage'

describe('<ABTestSettingPage />', () => {
    it('renders', () => {
        const {getByText} = render(<ABTestSettingPage />)
        expect(getByText('Back to Campaigns list')).toBeInTheDocument()
    })
})
