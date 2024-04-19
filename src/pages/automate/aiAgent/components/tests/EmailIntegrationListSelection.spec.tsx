import React from 'react'
import {render} from '@testing-library/react'
import {EmailIntegrationListSelection} from '../EmailIntegrationListSelection'

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
