import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationOfflineSettings from '../HandoverCustomizationOfflineSettings'

describe('HandoverCustomizationOfflineSettings', () => {
    it('renders correctly', () => {
        render(<HandoverCustomizationOfflineSettings />)

        screen.getByText('HandoverCustomizationOfflineSettings')
    })
})
