import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import {mockChatChannels} from '../../fixtures/chatChannels.fixture'

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
        const dropdown = screen.getByTestId('chat-dropdown')
        fireEvent.focus(dropdown)

        const testId = `chat-dropdown-item-${chatToSelect.value.meta.app_id}`
        const chatCheckbox = screen.getByTestId(testId)
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

        const dropdown = screen.getByTestId('chat-dropdown')
        fireEvent.focus(dropdown)

        const testId = `chat-dropdown-item-${mockSelectedChat.value.meta.app_id}`
        const chatCheckbox = screen.getByTestId(testId)
        fireEvent.click(chatCheckbox)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([])
    })
})
