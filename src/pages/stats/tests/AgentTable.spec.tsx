import {render, screen} from '@testing-library/react'
import React from 'react'
import {AgentsTable} from 'pages/stats/AgentsTable'

describe('<AgentTable>', () => {
    it('should render the table title', () => {
        render(<AgentsTable />)

        expect(screen.getByRole('table')).toBeInTheDocument()
    })
})
