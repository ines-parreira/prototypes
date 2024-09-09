import {render, screen} from '@testing-library/react'
import React from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import userEvent from '@testing-library/user-event'
import {FeatureFlagKey} from 'config/featureFlags'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {getAccountConfigurationWithHttpIntegrationFixture} from '../../fixtures/accountConfiguration.fixture'
import {usePlaygroundMessages} from '../../hooks/usePlaygroundMessages'
import {usePlaygroundForm} from '../../hooks/usePlaygroundForm'
import {PlaygroundChat} from './PlaygroundChat'

jest.mock('../../hooks/usePlaygroundMessages', () => ({
    usePlaygroundMessages: jest.fn(),
}))
jest.mock('../../hooks/usePlaygroundForm', () => ({
    usePlaygroundForm: jest.fn(),
}))

const mockedUsePlaygroundMessages = jest.mocked(usePlaygroundMessages)
const mockedUsePlaygroundForm = jest.mocked(usePlaygroundForm)

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
        mockedUsePlaygroundMessages.mockReturnValue({
            messages: [],
            onMessageSend: jest.fn(),
            onNewConversation: jest.fn(),
            isMessageSending: false,
        })
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

        expect(screen.getByText('Test a common question')).toBeInTheDocument()
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
})
