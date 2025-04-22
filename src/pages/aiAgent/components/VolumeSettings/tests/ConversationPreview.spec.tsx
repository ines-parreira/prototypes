import { render } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import * as chatColorHook from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import * as contextHook from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { ConversationPreview } from '../ConversationPreview'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')

const mockUseGetChatIntegrationColor = jest.mocked(
    chatColorHook.useGetChatIntegrationColor,
)
const mockUseAiAgentStoreConfigurationContext = jest.mocked(
    contextHook.useAiAgentStoreConfigurationContext,
)

type FormValues = {
    isConversationStartersEnabled: boolean
    isFloatingInputEnabled: boolean
}

const FormWrapper = ({ defaultValues }: { defaultValues: FormValues }) => {
    const methods = useForm<FormValues>({ defaultValues })
    return (
        <FormProvider {...methods}>
            <ConversationPreview />
        </FormProvider>
    )
}

describe('ConversationPreview', () => {
    beforeEach(() => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...getStoreConfigurationFixture(),
                storeName: 'Test Store',
                monitoredChatIntegrations: [1],
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        mockUseGetChatIntegrationColor.mockReturnValue({
            conversationColor: '#000000',
            mainColor: '#000000',
        })
    })

    it('renders conversation starters when enabled', () => {
        const result = render(
            <FormWrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isFloatingInputEnabled: false,
                }}
            />,
        )

        expect(
            result.getByText('Can this product be used daily?'),
        ).toBeInTheDocument()
        expect(
            result.getByText('Is this suitable for sensitive skin?'),
        ).toBeInTheDocument()
        expect(
            result.getByText('Does this contain fragrances?'),
        ).toBeInTheDocument()
    })

    it('renders floating chat input preview when enabled', () => {
        const result = render(
            <FormWrapper
                defaultValues={{
                    isConversationStartersEnabled: false,
                    isFloatingInputEnabled: true,
                }}
            />,
        )

        expect(result.getByText('Hi! How can I help?')).toBeInTheDocument()
    })

    it('renders both when both features are enabled', () => {
        const result = render(
            <FormWrapper
                defaultValues={{
                    isConversationStartersEnabled: true,
                    isFloatingInputEnabled: true,
                }}
            />,
        )

        expect(
            result.getByText('Can this product be used daily?'),
        ).toBeInTheDocument()
        expect(result.getByText('Hi! How can I help?')).toBeInTheDocument()
    })

    it('renders neither when both features are disabled', () => {
        const result = render(
            <FormWrapper
                defaultValues={{
                    isConversationStartersEnabled: false,
                    isFloatingInputEnabled: false,
                }}
            />,
        )

        expect(
            result.queryByText('Can this product be used daily?'),
        ).not.toBeInTheDocument()
        expect(
            result.queryByText('Hi! How can I help?'),
        ).not.toBeInTheDocument()
    })

    it('always renders the chat widget launcher', () => {
        const result = render(
            <FormWrapper
                defaultValues={{
                    isConversationStartersEnabled: false,
                    isFloatingInputEnabled: false,
                }}
            />,
        )

        expect(result.getByText('Chat Widget')).toBeInTheDocument()
    })
})
