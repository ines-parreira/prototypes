import React, { ComponentProps } from 'react'

import userEvent from '@testing-library/user-event'

import { AlertType } from 'pages/common/components/Alert/Alert'
import { renderWithRouter } from 'utils/testing'

import { AiAgentActivationStoreCard } from '../AiAgentActivationStoreCard'

const renderComponent = (
    props: ComponentProps<typeof AiAgentActivationStoreCard>,
) => renderWithRouter(<AiAgentActivationStoreCard {...props} />)

const testProps: ComponentProps<typeof AiAgentActivationStoreCard> = {
    store: {
        name: 'steve-madden',
        title: 'Steve Madden',
        sales: {
            isDisabled: true,
            enabled: false,
        },
        support: {
            enabled: false,
            chat: {
                enabled: false,
                isIntegrationMissing: false,
            },
            email: {
                enabled: false,
                isIntegrationMissing: false,
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
    onToggleSales: jest.fn(),
    onToggleSupport: jest.fn(),
    onToggleSupportChat: jest.fn(),
    onToggleSupportEmail: jest.fn(),
}

describe('<AiAgentActivationStoreCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const { getByText, queryByText, container, rerenderComponent } =
            renderComponent(testProps)

        expect(getByText('Steve Madden')).toBeInTheDocument()

        expect(getByText('Activate Support for Chat')).toBeInTheDocument()
        expect(getByText('Activate Support for Email')).toBeInTheDocument()

        const supportChatCheckbox = container.querySelector('#support__chat')
        expect(supportChatCheckbox).toBeInTheDocument()
        userEvent.click(supportChatCheckbox!)
        expect(testProps.onToggleSupportChat).toHaveBeenCalled()

        const supportEmailCheckbox = container.querySelector('#support__email')
        expect(supportEmailCheckbox).toBeInTheDocument()
        userEvent.click(supportEmailCheckbox!)
        expect(testProps.onToggleSupportEmail).toHaveBeenCalled()

        const updatedProps: ComponentProps<typeof AiAgentActivationStoreCard> =
            {
                ...testProps,
                store: {
                    ...testProps.store,
                    support: {
                        ...testProps.store.support,
                        chat: {
                            ...testProps.store.support.chat,
                            isIntegrationMissing: true,
                        },
                        email: {
                            ...testProps.store.support.email,
                            isIntegrationMissing: true,
                        },
                    },
                },
            }
        rerenderComponent(<AiAgentActivationStoreCard {...updatedProps} />)

        expect(queryByText('Activate Support for Chat')).not.toBeInTheDocument()
        expect(
            queryByText('Activate Support for Email'),
        ).not.toBeInTheDocument()
        expect(getByText('Select Integration for Chat')).toBeInTheDocument()
        expect(getByText('Select Integration for Email')).toBeInTheDocument()
    })
})
