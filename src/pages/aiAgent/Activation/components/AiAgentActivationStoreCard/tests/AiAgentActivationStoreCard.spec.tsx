import React, { ComponentProps } from 'react'

import userEvent from '@testing-library/user-event'

import { AlertType } from 'pages/common/components/Alert/Alert'
import { renderWithRouter } from 'utils/testing'

import {
    AiAgentActivationStoreCard,
    StoreActivation,
} from '../AiAgentActivationStoreCard'

const renderComponent = (
    props: ComponentProps<typeof AiAgentActivationStoreCard>,
) => renderWithRouter(<AiAgentActivationStoreCard {...props} />)

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
            type: AlertType.Warning,
            message:
                'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
            cta: { label: 'Visit Knowledge', to: '/' },
        },
    ],
} as any as StoreActivation

describe('<AiAgentActivationStoreCard />', () => {
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

        expect(getByText('Activate Support for Chat')).toBeInTheDocument()
        expect(getByText('Activate Support for Email')).toBeInTheDocument()

        expect(
            getByText(
                'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
            ),
        ).toBeInTheDocument()
    })

    it('should allow to select a Support channel when there is no alert', () => {
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
        expect(onSupportChatChange).toHaveBeenCalledWith(false)
    })

    it('should not allow select a Support channel when there is some alerts', () => {
        const { getByLabelText } = renderComponent({
            store: storeWithAlert,
            onSalesChange,
            onSupportChange,
            onSupportChatChange,
            onSupportEmailChange,
            closeModal,
        })

        const supportChatCheckbox = getByLabelText('Chat')
        userEvent.click(supportChatCheckbox!)
        expect(onSupportChatChange).not.toHaveBeenCalled()
    })

    it('should close the modal when clicking on an alert link', () => {
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
        expect(closeModal).toHaveBeenCalled()
    })

    it.each([
        { integration: 'chat', text: 'Select Integration for Chat' },
        { integration: 'email', text: 'Select Integration for Email' },
    ])(
        'should close the modal when clicking on a missing $integration integration',
        ({ text }) => {
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
            expect(closeModal).toHaveBeenCalled()
        },
    )
})
