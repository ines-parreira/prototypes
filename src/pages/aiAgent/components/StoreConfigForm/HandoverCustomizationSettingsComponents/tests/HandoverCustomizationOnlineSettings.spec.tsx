import React from 'react'

import { render, screen } from '@testing-library/react'

import HandoverCustomizationOnlineSettings from '../HandoverCustomizationOnlineSettings'

describe('HandoverCustomizationOnlineSettings', () => {
    it('renders correctly', () => {
        render(<HandoverCustomizationOnlineSettings />)

        screen.getByText('HandoverCustomizationOnlineSettings')
    })
})
