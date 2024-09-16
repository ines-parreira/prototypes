import {render, screen} from '@testing-library/react'
import React from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import userEvent from '@testing-library/user-event'
import {FeatureFlagKey} from 'config/featureFlags'
import {MessageType, TicketOutcome} from 'models/aiAgentPlayground/types'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {getAccountConfigurationWithHttpIntegrationFixture} from '../../fixtures/accountConfiguration.fixture'
import {usePlaygroundMessages} from '../../hooks/usePlaygroundMessages'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {CustomerHttpIntegrationDataMock} from '../../constants'
import {PlaygroundChat} from './PlaygroundChat'

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(),
}))
jest.mock('../../hooks/usePlaygroundForm', () => ({
    usePlaygroundForm: jest.fn(),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent.js',
    () => () => <div />
)
const mockedUsePlaygroundMessages = jest.mocked(usePlaygroundMessages)
const mockedUsePlaygroundForm = jest.mocked(usePlaygroundForm)

const defaultUsePlaygroundMessagesProps = {
    messages: [],
    onMessageSend: jest.fn(),
    onNewConversation: jest.fn(),
    isMessageSending: false,
    isWaitingResponse: false,
}

const defaultUsePlaygroundFormProps = {
    formValues: {message: ''},
    onFormValuesChange: jest.fn(),
    isDisabled: false,
    isFormValid: false,
    clearForm: jest.fn(),
    isPendingResources: false,
    isKnowledgeBaseEmpty: false,
    disabledMessage: undefined,
}

const renderComponent = () => {
    render(
        <PlaygroundChat
            storeData={getStoreConfigurationFixture()}
            accountData={getAccountConfigurationWithHttpIntegrationFixture()}
        />
    )
}

describe('PlaygroundChat', () => {
    beforeEach(() => {
        mockedUsePlaygroundMessages.mockReturnValue(
            defaultUsePlaygroundMessagesProps
        )
        mockedUsePlaygroundForm.mockReturnValue({
            formValues: {message: ''},
            onFormValuesChange: jest.fn(),
            isDisabled: false,
            isFormValid: false,
            clearForm: jest.fn(),
            isPendingResources: false,
            isKnowledgeBaseEmpty: false,
            disabledMessage: undefined,
        })

        mockFlags({
            [FeatureFlagKey.AiAgentChatTestMode]: true,
        })
    })

    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText('Or test a common question')
        ).toBeInTheDocument()
    })

    it('should change channel', () => {
        renderComponent()
        expect(screen.getByRole('tab', {selected: true})).toHaveTextContent(
            'Email'
        )
        userEvent.click(screen.getByText('Chat'))
        expect(screen.getByRole('tab', {selected: true})).toHaveTextContent(
            'Chat'
        )
    })

    describe('Chat', () => {
        it('should render chat with messages', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Hello',
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Hello')).toBeInTheDocument()
        })

        it('should render ticket close event', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Closed')).toBeInTheDocument()
        })

        it('should render placeholder message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.PLACEHOLDER,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Checking permissions')).toBeInTheDocument()
        })

        it('should render error message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.ERROR,
                        content: <div>Error Message</div>,
                        createdDatetime: '2021-09-01T00:00:00Z',
                    },
                ],
            })
            renderComponent()
            expect(screen.getByText('Error Message')).toBeInTheDocument()
        })

        it('should call onSendMessage with default email when no customer selected', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                formValues: {message: 'Hello'},
                isFormValid: true,
            })
            renderComponent()
            userEvent.click(screen.getByRole('button', {name: 'Send'}))
            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'Hello',
                    type: MessageType.MESSAGE,
                    sender: CustomerHttpIntegrationDataMock.name,
                }),
                {
                    customerEmail: CustomerHttpIntegrationDataMock.address,
                    subject: undefined,
                }
            )
        })

        it('should call onSendMessage with selected customer email', () => {
            mockedUsePlaygroundForm.mockReturnValue({
                ...defaultUsePlaygroundFormProps,
                isFormValid: true,
                formValues: {message: 'Hello', customerEmail: 'test@mail.com'},
            })

            renderComponent()

            userEvent.click(screen.getByRole('button', {name: 'Send'}))
            expect(
                defaultUsePlaygroundMessagesProps.onMessageSend
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: 'Hello',
                    type: MessageType.MESSAGE,
                    sender: 'test@mail.com',
                }),
                {
                    customerEmail: 'test@mail.com',
                    subject: undefined,
                }
            )
        })

        it('should hide predefined messages when sending message', () => {
            mockedUsePlaygroundMessages.mockReturnValue({
                ...defaultUsePlaygroundMessagesProps,
                isMessageSending: true,
            })
            renderComponent()
            expect(
                screen.queryByText('Or test a common question')
            ).not.toBeInTheDocument()
        })
    })
})
