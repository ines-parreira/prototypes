import React from 'react'

import { render, screen } from '@testing-library/react'

import { KnowledgeHubContainer } from './KnowledgeHubContainer'

describe('KnowledgeHubContainer', () => {
    it('should render the component', () => {
        render(<KnowledgeHubContainer />)

        expect(screen.getByText('KnowledgeHubContainer')).toBeInTheDocument()
    })
})
