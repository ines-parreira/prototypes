import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { appQueryClient } from 'api/queryClient'

import KnowledgePreview from '../KnowledgePreview'

describe('KnowledgePreview', () => {
    jest.useFakeTimers()

    it('should render without crashing', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <KnowledgePreview />
            </QueryClientProvider>,
        )

        expect(screen.getAllByText('Average order per day').length).toBe(2)
        expect(screen.getAllByText('Top Locations').length).toBe(2)
        expect(screen.getAllByText('Top Products').length).toBe(2)
        expect(screen.getAllByText('Top Categories').length).toBe(2)
        expect(screen.getAllByText('Experience score').length).toBe(2)
        expect(screen.getAllByText('Average discount given').length).toBe(2)
        expect(screen.getAllByText('Repeat Rate').length).toBe(2)
    })
})
