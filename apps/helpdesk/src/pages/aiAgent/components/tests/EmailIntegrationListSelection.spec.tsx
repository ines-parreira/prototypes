import React from 'react'

import { render } from '@repo/testing'

import { EmailIntegrationListSelection } from '../EmailIntegrationListSelection/EmailIntegrationListSelection'

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
