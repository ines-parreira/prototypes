import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationFallbackSettings from '../HandoverCustomizationFallbackSettings'

describe('HandoverCustomizationFallbackSettings', () => {
    it('renders correctly', () => {
        render(<HandoverCustomizationFallbackSettings />)

        screen.getByText('HandoverCustomizationFallbackSettings')
    })
})
