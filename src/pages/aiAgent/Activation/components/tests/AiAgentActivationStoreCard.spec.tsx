import React, { ComponentProps } from 'react'

import { fireEvent } from '@testing-library/react'

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
            enabled: false,
            onToggle: jest.fn(),
        },
        support: {
            onToggle: jest.fn(),
            chat: {
                enabled: false,
                onToggle: jest.fn(),
                isIntegrationMissing: false,
            },
            email: {
                enabled: false,
                isIntegrationMissing: false,
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
        const { getByText, queryByText, container, rerenderComponent } =
            renderComponent(testProps)

        expect(getByText('Steve Madden')).toBeInTheDocument()

        getByText('Manage channels').click()

        expect(getByText('Activate Support for Chat')).toBeInTheDocument()
        expect(getByText('Activate Support for Email')).toBeInTheDocument()

        const supportChatCheckbox = container.querySelector('#support__chat')
        expect(supportChatCheckbox).toBeInTheDocument()
        fireEvent.click(supportChatCheckbox!)
        expect(testProps.store.support.chat.onToggle).toHaveBeenCalled()

        const supportEmailCheckbox = container.querySelector('#support__email')
        expect(supportEmailCheckbox).toBeInTheDocument()
        fireEvent.click(supportEmailCheckbox!)
        expect(testProps.store.support.email.onToggle).toHaveBeenCalled()

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

        getByText('Manage channels').click()

        expect(queryByText('Activate Support for Chat')).not.toBeInTheDocument()
        expect(
            queryByText('Activate Support for Email'),
        ).not.toBeInTheDocument()
        expect(getByText('Select Integration for Chat')).toBeInTheDocument()
        expect(getByText('Select Integration for Email')).toBeInTheDocument()
    })
})
