import React from 'react'

import { render, screen } from '@testing-library/react'

import { PerformanceBadge } from './PerformanceBadge'

describe('<PerformanceBadge />', () => {
    it('should render content properly', () => {
        render(<PerformanceBadge content="AI Journey Performance" />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
})
