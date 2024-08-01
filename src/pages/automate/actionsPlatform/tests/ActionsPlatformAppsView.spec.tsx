import React from 'react'
import {render, screen} from '@testing-library/react'

import ActionsPlatformAppsView from '../ActionsPlatformAppsView'

describe('<ActionsPlatformAppsView />', () => {
    it('should render actions platform apps page', () => {
        render(<ActionsPlatformAppsView />)

        expect(screen.getByText('ActionsPlatformAppsView')).toBeInTheDocument()
    })
})
