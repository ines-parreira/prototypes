import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'

import { ChatIntegrationListSelection } from './ChatIntegrationListSelection'

// Mock data
const mockSelectedChat = mockChatChannels[0]
const mockSelectedIds = [mockSelectedChat.value.id]

// Create a mock chat channel that is disabled
const mockDisabledChat = {
    ...mockChatChannels[0],
    value: {
        ...mockChatChannels[0].value,
        isDisabled: true,
    },
}

describe('ChatIntegrationListSelection', () => {
    it('should add a new ID to selectedIds when toggled on', () => {
        const mockOnSelectionChange = jest.fn()
        render(
            <ChatIntegrationListSelection
                onSelectionChange={mockOnSelectionChange}
                selectedIds={mockSelectedIds}
                chatItems={mockChatChannels}
                hasError={false}
            />,
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
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)
        const chatCheckbox = screen.getByRole('option', {
            name: mockSelectedChat.value.name,
        })
        fireEvent.click(chatCheckbox)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([])
    })

    it('should display the disabled text when withDisabledText is true', () => {
        render(
            <ChatIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                chatItems={[mockDisabledChat]}
                hasError={false}
                withDisabledText={true}
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        expect(
            screen.getByText(mockDisabledChat.value.name),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Chat already used by AI Agent in another store'),
        ).toBeInTheDocument()
    })

    it('should NOT display the disabled text when withDisabledText is false', () => {
        render(
            <ChatIntegrationListSelection
                onSelectionChange={jest.fn()}
                selectedIds={[]}
                chatItems={[mockDisabledChat]}
                hasError={false}
                withDisabledText={false}
            />,
        )

        const dropdown = screen.getByRole('combobox')
        fireEvent.focus(dropdown)

        expect(
            screen.getByText(mockDisabledChat.value.name),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Chat already used by AI Agent in another store',
            ),
        ).not.toBeInTheDocument()
    })
})
