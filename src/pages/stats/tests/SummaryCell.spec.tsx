import React from 'react'
import {render, screen} from '@testing-library/react'
import {SummaryCell} from 'pages/stats/SummaryCell'

describe('<SummaryCell>', () => {
    it('should render', () => {
        render(<SummaryCell />)

        expect(screen.getByText('Average')).toBeInTheDocument()
    })
})
