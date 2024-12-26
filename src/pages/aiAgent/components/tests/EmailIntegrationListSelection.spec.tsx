import {render} from '@testing-library/react'
import React from 'react'

import {EmailIntegrationListSelection} from '../EmailIntegrationListSelection/EmailIntegrationListSelection'

describe('EmailIntegrationListSelection', () => {
    it('renders correctly', () => {
        const mockProps = {
            onSelectionChange: jest.fn(),
            selectedIds: [],
            emailItems: [],
        }

        render(<EmailIntegrationListSelection {...mockProps} />)
    })
})
