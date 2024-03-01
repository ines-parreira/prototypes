import React from 'react'
import {render, screen} from '@testing-library/react'
import {EmailIntegrationListSelection} from '../EmailIntegrationListSelection'

describe('EmailIntegrationListSelection', () => {
    it('renders the label text', () => {
        const mockProps = {
            onSelectionChange: jest.fn(),
            selectedIds: [],
            emailItems: [],
        }

        render(<EmailIntegrationListSelection {...mockProps} />)

        screen.getByText('Which email addresses should trigger the AI Agent?')

        screen.getByText('Select one or more email addresses')
    })
})
