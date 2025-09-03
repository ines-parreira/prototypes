import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ChatSettingsFormComponent } from '../ChatSettingsFormComponent'

describe('ChatSettingsFormComponent', () => {
    const mockProps = {
        updateValue: jest.fn(),
        monitoredChatIntegrations: [1, 2],
        chatChannels: [
            {
                type: 'chat',
                value: { id: 1, name: 'Chat 1', meta: { app_id: 123 } },
            },
            {
                type: 'chat',
                value: { id: 2, name: 'Chat 2', meta: { app_id: 456 } },
            },
        ] as any,
        isRequired: true,
        setIsPristine: jest.fn(),
    }

    it('should display error message when isRequired is true and no chat is selected', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrations={[]}
            />,
        )

        expect(
            screen.getByText('One or more Chats required.'),
        ).toBeInTheDocument()
    })

    it('should render chat settings form when isSettingsRevamp is %s', () => {
        render(<ChatSettingsFormComponent {...mockProps} />)

        expect(
            screen.getByText(/select one or more chats/i),
        ).toBeInTheDocument()
    })

    it('should use initial values when monitoredChatIntegrations is null', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrations={null}
            />,
        )

        expect(screen.getByRole('combobox')).toHaveTextContent(
            'Select one or more chat integrations',
        )
    })

    it('should use initial values when monitoredChatIntegrations is null', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                isRequired={true}
                monitoredChatIntegrations={null}
            />,
        )

        expect(screen.getByRole('combobox')).toHaveTextContent(
            'Select one or more chat integrations',
        )
    })

    it('should use monitoredChatIntegrations when provided', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrations={[1, 2]}
            />,
        )

        expect(screen.getByRole('combobox')).toHaveTextContent('Chat 1, Chat 2')
    })

    it('should display error message when the chat integration is required and invalid', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrations={[]}
                isRequired={true}
            />,
        )

        expect(
            screen.getByText('One or more Chats required.'),
        ).toBeInTheDocument()
    })

    it('should not display error message when the chat is not required', () => {
        render(
            <ChatSettingsFormComponent
                {...mockProps}
                monitoredChatIntegrations={[]}
                isRequired={false}
            />,
        )

        expect(
            screen.queryByText('One or more Chats required.'),
        ).not.toBeInTheDocument()
    })

    it('should prefill monitoredChatIntegrations with initialValue when conditions are met', () => {
        const initialValue = 3
        const updateValue = jest.fn()

        render(
            <ChatSettingsFormComponent
                {...mockProps}
                updateValue={updateValue}
                monitoredChatIntegrations={[]}
                initialValue={initialValue}
                shouldPrefillValue={true}
            />,
        )

        expect(updateValue).toHaveBeenCalledWith('monitoredChatIntegrations', [
            initialValue,
        ])
    })

    it('should not prefill monitoredChatIntegrations when monitoredChatIntegrations is not empty', () => {
        const initialValue = 3
        const updateValue = jest.fn()

        render(
            <ChatSettingsFormComponent
                {...mockProps}
                updateValue={updateValue}
                monitoredChatIntegrations={[1]}
                initialValue={initialValue}
                shouldPrefillValue={true}
            />,
        )

        expect(updateValue).not.toHaveBeenCalled()
    })

    it('should not prefill monitoredChatIntegrations when monitoredChatIntegrations is null', () => {
        const initialValue = 3
        const updateValue = jest.fn()

        render(
            <ChatSettingsFormComponent
                {...mockProps}
                updateValue={updateValue}
                monitoredChatIntegrations={null}
                initialValue={initialValue}
                shouldPrefillValue={true}
            />,
        )

        expect(updateValue).not.toHaveBeenCalled()
    })

    it('should display uninstalled chat error message when a selected chat is uninstalled', () => {
        const uninstalledChatChannels = [
            {
                type: 'chat',
                value: {
                    id: 1,
                    name: 'Chat 1',
                    meta: { app_id: 123 },
                    isUninstalled: true,
                },
            },
            {
                type: 'chat',
                value: { id: 2, name: 'Chat 2', meta: { app_id: 456 } },
            },
        ] as any

        render(
            <MemoryRouter>
                <ChatSettingsFormComponent
                    {...mockProps}
                    monitoredChatIntegrations={[1]}
                    chatChannels={uninstalledChatChannels}
                />
            </MemoryRouter>,
        )

        expect(
            screen.getByText('One or more Chats are not installed.'),
        ).toBeInTheDocument()
        expect(screen.getByText('Install Chat')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })

    it('should still display uninstalled chat error message when the chat is not required', () => {
        const uninstalledChatChannels = [
            {
                type: 'chat',
                value: {
                    id: 1,
                    name: 'Chat 1',
                    meta: { app_id: 123 },
                    isUninstalled: true,
                },
            },
            {
                type: 'chat',
                value: { id: 2, name: 'Chat 2', meta: { app_id: 456 } },
            },
        ] as any

        render(
            <MemoryRouter>
                <ChatSettingsFormComponent
                    {...mockProps}
                    isRequired={false}
                    monitoredChatIntegrations={[1]}
                    chatChannels={uninstalledChatChannels}
                />
            </MemoryRouter>,
        )

        expect(
            screen.getByText('One or more Chats are not installed.'),
        ).toBeInTheDocument()
        expect(screen.getByText('Install Chat')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })

    it('should render the install chat link with correct URL', () => {
        const chatId = 123
        const uninstalledChatChannels = [
            {
                type: 'chat',
                value: {
                    id: chatId,
                    name: 'Chat 1',
                    meta: { app_id: 456 },
                    isUninstalled: true,
                },
            },
        ] as any

        render(
            <MemoryRouter>
                <ChatSettingsFormComponent
                    {...mockProps}
                    monitoredChatIntegrations={[chatId]}
                    chatChannels={uninstalledChatChannels}
                />
            </MemoryRouter>,
        )

        const installLink = screen.getByText('Install Chat').closest('a')
        expect(installLink).toHaveAttribute(
            'to',
            `/app/settings/channels/gorgias_chat/${chatId}/installation`,
        )
    })

    it('should use first uninstalled chat for the installation link when multiple chats are uninstalled', () => {
        const firstUninstalledChatId = 123
        const secondUninstalledChatId = 456
        const multipleUninstalledChats = [
            {
                type: 'chat',
                value: { id: 789, name: 'Chat 1', meta: { app_id: 654 } },
            },
            {
                type: 'chat',
                value: {
                    id: firstUninstalledChatId,
                    name: 'Chat 2',
                    meta: { app_id: 789 },
                    isUninstalled: true,
                },
            },
            {
                type: 'chat',
                value: {
                    id: secondUninstalledChatId,
                    name: 'Chat 3',
                    meta: { app_id: 987 },
                    isUninstalled: true,
                },
            },
        ] as any

        render(
            <MemoryRouter>
                <ChatSettingsFormComponent
                    {...mockProps}
                    monitoredChatIntegrations={[
                        789,
                        firstUninstalledChatId,
                        secondUninstalledChatId,
                    ]}
                    chatChannels={multipleUninstalledChats}
                />
            </MemoryRouter>,
        )

        const installLink = screen.getByText('Install Chat').closest('a')
        expect(installLink).toHaveAttribute(
            'to',
            `/app/settings/channels/gorgias_chat/${firstUninstalledChatId}/installation`,
        )
    })
})
