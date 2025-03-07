import React, { ComponentProps } from 'react'

import { fireEvent } from '@testing-library/react'

import { AlertType } from 'pages/common/components/Alert/Alert'
import { renderWithRouter } from 'utils/testing'

import { AiAgentActivationStoreCard } from '../AiAgentActivationStoreCard'

const renderComponent = (
    props: ComponentProps<typeof AiAgentActivationStoreCard>,
) => renderWithRouter(<AiAgentActivationStoreCard {...props} />)

const testProps = {
    store: {
        name: 'Steve Madden',
        sales: {
            enabled: false,
            onToggle: jest.fn(),
        },
        support: {
            onToggle: jest.fn(),
            chat: {
                enabled: false,
                integration: undefined,
                onToggle: jest.fn(),
            },
            email: {
                enabled: false,
                integration: undefined,
                onToggle: jest.fn(),
            },
        },
    },
    alerts: [
        {
            type: AlertType.Warning,
            message:
                'At least one knowledge source required. Update in “Knowledge” to be able to activate AI Agent.',
            cta: { label: 'Visit Knowledge', to: '/' },
        },
    ],
}

describe('<AiAgentActivationStoreCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const result = renderComponent(testProps)

        expect(result.getByText('Steve Madden')).toBeInTheDocument()

        result.getByText('Manage channels').click()

        expect(
            result.getByText('Activate Support for Chat'),
        ).toBeInTheDocument()
        expect(
            result.getByText('Activate Support for Email'),
        ).toBeInTheDocument()

        const supportChatCheckbox =
            result.container.querySelector('#support__chat')
        expect(supportChatCheckbox).toBeInTheDocument()
        fireEvent.click(supportChatCheckbox!)
        expect(testProps.store.support.chat.onToggle).toHaveBeenCalled()

        const supportEmailCheckbox =
            result.container.querySelector('#support__email')
        expect(supportEmailCheckbox).toBeInTheDocument()
        fireEvent.click(supportEmailCheckbox!)
        expect(testProps.store.support.email.onToggle).toHaveBeenCalled()
    })
})
