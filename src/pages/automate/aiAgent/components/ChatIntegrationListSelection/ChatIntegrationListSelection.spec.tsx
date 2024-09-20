import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import {mockChatChannels} from 'pages/automate/aiAgent/fixtures/chatChannels.fixture'

import {ChatIntegrationListSelection} from './ChatIntegrationListSelection'

// Mock data

const mockSelectedChat = mockChatChannels[0]
const mockSelectedIds = [mockSelectedChat.value.id]

describe('ChatIntegrationListSelection', () => {
    it('should add a new ID to selectedIds when toggled on', () => {
        const mockOnSelectionChange = jest.fn()
        render(
            <ChatIntegrationListSelection
                onSelectionChange={mockOnSelectionChange}
                selectedIds={mockSelectedIds}
                chatItems={mockChatChannels}
                hasError={false}
            />
        )

        const chatToSelect = mockChatChannels[1]
        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)
        const chatCheckbox = screen.getByText(chatToSelect.value.name)
        fireEvent.click(chatCheckbox)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([
            ...mockSelectedIds,
            chatToSelect.value.id,
        ])
    })

    it('should remove an ID from selectedIds when toggled off', () => {
        const mockOnSelectionChange = jest.fn()
        render(
            <ChatIntegrationListSelection
                onSelectionChange={mockOnSelectionChange}
                selectedIds={mockSelectedIds}
                chatItems={mockChatChannels}
                hasError={false}
            />
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)
        const chatCheckbox = screen.getByRole('option', {
            name: mockSelectedChat.value.name,
        })
        fireEvent.click(chatCheckbox)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([])
    })
})
