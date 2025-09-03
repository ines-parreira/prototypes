import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useFlag } from 'core/flags'
import { LegacyAiAgentActivationStoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/LegacyAiAgentActivationStoreCard'
import {
    KNOWLEDGE_ALERT_KIND,
    StoreActivation,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { AlertType } from 'pages/common/components/Alert/Alert'
import { renderWithRouter } from 'utils/testing'

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

jest.mock('pages/aiAgent/hooks/useGetAlreadyUsedEmailIntegrationIds', () => ({
    useGetAlreadyUsedEmailIntegrationIds: () => [3],
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
        {
            value: {
                id: 2,
                name: 'Chat Channel 2',
            },
        },
    ],
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const renderComponent = (
    props: ComponentProps<typeof LegacyAiAgentActivationStoreCard>,
) => renderWithRouter(<LegacyAiAgentActivationStoreCard {...props} />)

const storeWithoutAlert = {
    name: 'steve-madden',
    title: 'Steve Madden',
    sales: {
        isDisabled: false,
        enabled: true,
    },
    support: {
        enabled: true,
        chat: {
            enabled: true,
            isIntegrationMissing: false,
        },
        email: {
            enabled: true,
            isIntegrationMissing: false,
        },
    },
    alert: [],
    configuration: {
        shopType: 'shopify',
        shopName: 'steve-madden',
        monitoredChatIntegrations: [1],
        monitoredEmailIntegrations: [
            {
                id: 1,
                email: 'foo@example.com',
            },
        ],
    },
} as any as StoreActivation
const storeWithIntegrationMissing = {
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
} as any as StoreActivation
const storeWithAlert = {
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
} as any as StoreActivation

describe('<LegacyAiAgentActivationStoreCard />', () => {
    const onSalesChange = jest.fn()
    const onSupportChange = jest.fn()
    const onSupportChatChange = jest.fn()
    const onSupportEmailChange = jest.fn()
    const closeModal = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const { getByText } = renderComponent({
            store: storeWithAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        expect(getByText('Steve Madden')).toBeInTheDocument()

        expect(
            getByText('Activate Support for integrated chats.'),
        ).toBeInTheDocument()
        expect(
            getByText('Activate Support for integrated emails.'),
        ).toBeInTheDocument()

        expect(
            getByText(
                'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
            ),
        ).toBeInTheDocument()
    })

    it('should allow to select a Support channel when there is no alert', async () => {
        const { getByLabelText } = renderComponent({
            store: storeWithoutAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const supportChatCheckbox = getByLabelText('Chat')
        userEvent.click(supportChatCheckbox!)

        await waitFor(() => {
            expect(onSupportChatChange).toHaveBeenCalledWith(false)
        })
    })

    it('should not allow select a Support channel when there is some alerts', async () => {
        const { getByLabelText } = renderComponent({
            store: storeWithAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const supportChatCheckbox = getByLabelText('Chat')
        userEvent.click(supportChatCheckbox)

        await waitFor(() => {
            expect(onSupportChatChange).not.toHaveBeenCalled()
        })
    })

    it('should close the modal when clicking on an alert link', async () => {
        const { getByText } = renderComponent({
            store: storeWithAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const visitKnowledge = getByText('Visit Knowledge')
        userEvent.click(visitKnowledge)
        await waitFor(() => {
            expect(closeModal).toHaveBeenCalled()
        })
    })

    it.each([
        { integration: 'chat', text: 'Select Integration for Chat' },
        { integration: 'email', text: 'Select Integration for Email' },
    ])(
        'should close the modal when clicking on a missing $integration integration',
        async ({ text }) => {
            const { getByText } = renderComponent({
                store: storeWithIntegrationMissing,
                onSalesChange,
                onSupportChange,
                onSupportChatChange,
                onSupportEmailChange,
                closeModal,
            })

            const missingIntegrationLink = getByText(text)
            userEvent.click(missingIntegrationLink)
            await waitFor(() => {
                expect(closeModal).toHaveBeenCalled()
            })
        },
    )

    it('should display tooltips for integrated emails when hovering', async () => {
        const { getAllByText, getByRole } = renderComponent({
            store: storeWithoutAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const integratedEmailsSection = getAllByText(
            /integrated emails/i,
        )[0].closest('div') as HTMLElement

        expect(integratedEmailsSection).toBeInTheDocument()

        const emailTooltipIcon = integratedEmailsSection.querySelector(
            '.material-icons-outlined.icon',
        )

        expect(emailTooltipIcon).toBeInTheDocument()

        fireEvent.mouseOver(emailTooltipIcon as HTMLElement)

        await waitFor(() => {
            expect(getByRole('tooltip')).toHaveTextContent('integrated emails:')
            expect(getByRole('tooltip')).toHaveTextContent('foo@example.com')
            expect(getByRole('tooltip')).not.toHaveTextContent(
                'another@example.com',
            )
            expect(getByRole('tooltip')).not.toHaveTextContent(
                'test@example.com',
            )
        })
    })

    it('should display tooltips for integrated chats when hovering', async () => {
        const { getByRole, getAllByText } = renderComponent({
            store: storeWithoutAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const integratedChatsSection = getAllByText(
            /integrated chats/i,
        )[0].closest('div') as HTMLElement

        expect(integratedChatsSection).toBeInTheDocument()

        const chatTooltipIcon = integratedChatsSection.querySelector(
            '.material-icons-outlined.icon',
        )
        expect(chatTooltipIcon).toBeInTheDocument()

        fireEvent.mouseOver(chatTooltipIcon as HTMLElement)

        await waitFor(() => {
            expect(getByRole('tooltip')).toHaveTextContent('integrated chats:')
            expect(getByRole('tooltip')).toHaveTextContent('Chat Channel 1')
            expect(getByRole('tooltip')).not.toHaveTextContent('Chat Channel 2')
        })
    })

    it('should display the correct sales block copy when the AiSalesAgentActivationEmailSettings flag is enabled', () => {
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiSalesAgentActivationEmailSettings ||
                false,
        )
        const { getByText } = renderComponent({
            store: storeWithoutAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        expect(
            getByText(
                'Shopping Assistant can only be activated on the channel where Support Agent is activated.',
            ),
        ).toBeInTheDocument()
    })
})
