import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketChannel } from 'business/types/ticket'

import { ChatChannelSelector } from './ChatChannelSelector'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SelectField: <T extends { id: number; label: string }>({
        placeholder,
        items,
        value,
        onChange,
    }: {
        placeholder?: string
        items: T[]
        value: T | undefined
        onChange: (option: T | undefined) => void
        children: (option: T) => ReactNode
    }) => (
        <select
            aria-label="Chat channel selector"
            value={value?.id ?? ''}
            onChange={(e) => {
                const id = parseInt(e.target.value)
                const item = items.find((i) => i.id === id)
                onChange(item)
            }}
        >
            <option value="">{placeholder}</option>
            {items.map((item) => (
                <option key={item.id} value={item.id}>
                    {item.label}
                </option>
            ))}
        </select>
    ),
    ListItem: () => null,
}))

const mockChatChannels = [
    {
        type: TicketChannel.Chat,
        value: { id: 1, name: 'My Chat Channel', meta: { app_id: 'app-1' } },
    },
    {
        type: TicketChannel.Chat,
        value: {
            id: 2,
            name: 'Second Chat Channel',
            meta: { app_id: 'app-2' },
        },
    },
] as any

describe('ChatChannelSelector', () => {
    it('renders the selected channel', () => {
        render(
            <ChatChannelSelector
                chatChannels={mockChatChannels}
                selectedChannelId={1}
                onSelect={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('combobox', { name: /chat channel selector/i }),
        ).toHaveValue('1')
    })

    it('falls back to the first channel when selectedChannelId is undefined', () => {
        render(
            <ChatChannelSelector
                chatChannels={mockChatChannels}
                selectedChannelId={undefined}
                onSelect={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('combobox', { name: /chat channel selector/i }),
        ).toHaveValue('1')
    })

    it('calls onSelect with the channel id when a channel is selected', async () => {
        const onSelect = jest.fn()
        const user = userEvent.setup()

        render(
            <ChatChannelSelector
                chatChannels={mockChatChannels}
                selectedChannelId={1}
                onSelect={onSelect}
            />,
        )

        await user.selectOptions(
            screen.getByRole('combobox', { name: /chat channel selector/i }),
            '2',
        )

        expect(onSelect).toHaveBeenCalledWith(2)
    })

    it('renders all channel options', () => {
        render(
            <ChatChannelSelector
                chatChannels={mockChatChannels}
                selectedChannelId={1}
                onSelect={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('option', { name: 'My Chat Channel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Second Chat Channel' }),
        ).toBeInTheDocument()
    })
})
