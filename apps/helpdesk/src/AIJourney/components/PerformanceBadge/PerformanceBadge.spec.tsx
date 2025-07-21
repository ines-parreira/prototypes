import React from 'react'

import { render, screen } from '@testing-library/react'

import { PerformanceBadge } from './PerformanceBadge'

describe('<PerformanceBadge />', () => {
    it('should render content properly', () => {
        render(<PerformanceBadge />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
})
