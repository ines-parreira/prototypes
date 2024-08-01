import React from 'react'
import {render, screen} from '@testing-library/react'

import ActionsPlatformTemplatesView from '../ActionsPlatformTemplatesView'

describe('<ActionsPlatformTemplatesView />', () => {
    it('should render actions platform templates page', () => {
        render(<ActionsPlatformTemplatesView />)

        expect(
            screen.getByText('ActionsPlatformTemplatesView')
        ).toBeInTheDocument()
    })
})
