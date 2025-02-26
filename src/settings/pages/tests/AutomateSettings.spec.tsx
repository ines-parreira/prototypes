import React from 'react'

import { render, screen } from '@testing-library/react'

import { AutomateSettings } from '../AutomateSettings'

describe('AutomateSettings', () => {
    it('should render the header', () => {
        render(<AutomateSettings />)
        expect(screen.getByText('Automate')).toBeInTheDocument()
    })
})
