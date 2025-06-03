import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { useToolbarContext } from '../../ToolbarContext'
import GuidanceActionDropdown from '../GuidanceActionDropdown'

jest.mock('../../ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
}))

jest.mock('pages/common/components/Search', () => {
    return jest.fn(({ value, onChange }) => (
        <input
            data-testid="search-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ))
})

describe('GuidanceActionDropdown', () => {
    const mockTarget = { current: document.createElement('div') }

    const mockOnSelect = jest.fn()
    const mockOnToggle = jest.fn()

    const mockActions: GuidanceAction[] = [
        {
            name: 'Action 1',
            value: '&&&action-1&&&',
        },
        {
            name: 'Action 2',
            value: '&&&action-2&&&',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceActions: mockActions,
        })
    })

    it('renders actions when isOpen', () => {
        render(
            <GuidanceActionDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        expect(screen.getByText('Action 1')).toBeInTheDocument()
        expect(screen.getByText('Action 2')).toBeInTheDocument()
    })

    it('searches actions', () => {
        render(
            <GuidanceActionDropdown
                target={mockTarget}
                onSelect={mockOnSelect}
                isOpen={true}
                onToggle={mockOnToggle}
            />,
        )

        const searchInput = screen.getByTestId('search-input')
        fireEvent.change(searchInput, { target: { value: 'Action 1' } })

        expect(screen.queryByText('Action 1')).toBeInTheDocument()
        expect(screen.queryByText('Action 2')).not.toBeInTheDocument()

        fireEvent.change(searchInput, {
            target: { value: 'This action does not exist' },
        })

        expect(screen.queryByText('Action 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Action 2')).not.toBeInTheDocument()
        expect(screen.queryByText('No results')).toBeInTheDocument()

        fireEvent.change(searchInput, {
            target: { value: '' },
        })

        expect(screen.queryByText('Action 1')).toBeInTheDocument()
        expect(screen.queryByText('Action 2')).toBeInTheDocument()
    })
})
