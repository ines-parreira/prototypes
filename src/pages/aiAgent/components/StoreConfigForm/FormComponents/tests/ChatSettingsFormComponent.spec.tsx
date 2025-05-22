import { render, screen } from '@testing-library/react'

import { ChatSettingsFormComponent } from '../ChatSettingsFormComponent'

jest.mock('launchdarkly-react-client-sdk')

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
})
