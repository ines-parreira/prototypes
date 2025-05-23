import { ComponentProps } from 'react'

import { screen, waitFor } from '@testing-library/react'

import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import {
    KNOWLEDGE_ALERT_KIND,
    StoreActivation,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { getStoreConfigurationFixture } from 'pages/aiAgent/Activation/hooks/tests/fixtures/store-configurations.fixture'
import { AlertType } from 'pages/common/components/Alert/Alert'
import { renderWithRouter } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import { AiAgentActivationStoreCard } from '../AiAgentActivationStoreCard'

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: () => [
        {
            id: 1,
            meta: {
                address: 'foo@example.com',
                preferred: true,
            },
        },
        {
            id: 2,
            meta: {
                address: 'another@example.com',
                preferred: false,
            },
        },
        {
            id: 3,
            meta: {
                address: 'test@example.com',
                preferred: false,
            },
        },
    ],
}))

jest.mock('pages/aiAgent/hooks/useGetUsedEmailIntegrations', () => ({
    useGetUsedEmailIntegrations: () => [3],
}))
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: () => [
        {
            value: {
                id: 1,
                name: 'Chat Channel 1',
            },
        },
    ],
}))

const renderComponent = (
    props: ComponentProps<typeof AiAgentActivationStoreCard>,
) => renderWithRouter(<AiAgentActivationStoreCard {...props} />)

const storeWithoutAlert: StoreActivation = storeActivationFixture({
    storeName: 'steve-madden',
    settings: {
        sales: {
            isDisabled: false,
            enabled: true,
        },
        support: {
            enabled: true,
            chat: {
                enabled: true,
                isIntegrationMissing: false,
                isInstallationMissing: false,
            },
            email: {
                enabled: true,
                isIntegrationMissing: false,
            },
        },
    },
    configuration: getStoreConfigurationFixture({
        shopType: 'shopify',
        monitoredChatIntegrations: [1],
        monitoredEmailIntegrations: [
            {
                id: 1,
                email: 'foo@example.com',
            },
        ],
    }),
})
const storeWithIntegrationMissing: StoreActivation = {
    ...storeWithoutAlert,
    support: {
        ...storeWithoutAlert.support,
        chat: {
            ...storeWithoutAlert.support.chat,
            isIntegrationMissing: true,
        },
        email: {
            ...storeWithoutAlert.support.email,
            isIntegrationMissing: true,
        },
    },
}
const storeWithAlert: StoreActivation = {
    ...storeWithoutAlert,
    alerts: [
        {
            kind: KNOWLEDGE_ALERT_KIND,
            type: AlertType.Warning,
            message:
                'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
            cta: { label: 'Visit Knowledge', to: '/' },
        },
    ],
}

const ui = {
    chatToggle: () => screen.getByText('Chat'),
    chatTooltip: () => screen.getAllByText('info')[0],
    emailToggle: () => screen.getByText('Email'),
    emailTooltip: () => screen.getAllByText('info')[1],
}

describe('<AiAgentActivationStoreCard />', () => {
    const onChatChange = jest.fn()
    const onEmailChange = jest.fn()
    const closeModal = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component with alerts', () => {
        renderComponent({
            store: storeWithAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        expect(screen.getByText('steve-madden')).toBeInTheDocument()
        expect(
            screen.getByText('Enable Channels for AI Agent'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
            ),
        ).toBeInTheDocument()
    })

    it('should allow to select email / chat channel when there is no alert', () => {
        renderComponent({
            store: storeWithoutAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        userEvent.click(ui.chatToggle())
        expect(onChatChange).toHaveBeenCalledWith(false)

        userEvent.click(ui.emailToggle())
        expect(onEmailChange).toHaveBeenCalledWith(false)
    })

    it('should not allow select email / chat channel when there is some alerts', () => {
        renderComponent({
            store: storeWithAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        userEvent.click(ui.chatToggle())
        expect(onChatChange).not.toHaveBeenCalled()

        userEvent.click(ui.emailToggle())
        expect(onEmailChange).not.toHaveBeenCalled()
    })

    it('should not allow select email / chat channel when there are missing integrations', () => {
        renderComponent({
            store: storeWithIntegrationMissing,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        userEvent.click(ui.chatToggle())
        expect(onChatChange).not.toHaveBeenCalled()

        userEvent.click(ui.emailToggle())
        expect(onEmailChange).not.toHaveBeenCalled()
    })

    it('should close the modal when clicking on an alert link', () => {
        renderComponent({
            store: storeWithAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        const visitKnowledge = screen.getByText('Visit Knowledge')
        userEvent.click(visitKnowledge)
        expect(closeModal).toHaveBeenCalled()
    })

    it.each([
        { integration: 'chat', text: 'Select Integration for Chat' },
        { integration: 'email', text: 'Select Integration for Email' },
    ])(
        'should close the modal when clicking on a missing $integration integration',
        ({ text }) => {
            renderComponent({
                store: storeWithIntegrationMissing,
                onChatChange,
                onEmailChange,
                closeModal,
            })

            const missingIntegrationLink = screen.getByText(text)
            userEvent.click(missingIntegrationLink)
            expect(closeModal).toHaveBeenCalled()
        },
    )

    it('should display tooltip for integrated emails when hovering', async () => {
        renderComponent({
            store: storeWithoutAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        userEvent.hover(ui.emailTooltip())
        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'integrated emails:',
            )
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'foo@example.com',
            )
            expect(screen.getByRole('tooltip')).not.toHaveTextContent(
                'another@example.com',
            )
            expect(screen.getByRole('tooltip')).not.toHaveTextContent(
                'test@example.com',
            )
        })
    })

    it('should display tooltips for integrated chats when hovering', async () => {
        renderComponent({
            store: storeWithoutAlert,
            onChatChange,
            onEmailChange,
            closeModal,
        })

        userEvent.hover(ui.chatTooltip())

        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'integrated chats:',
            )
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'Chat Channel 1',
            )
            expect(screen.getByRole('tooltip')).not.toHaveTextContent(
                'Chat Channel 2',
            )
        })
    })
})
