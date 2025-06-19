import { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { IntegrationType } from 'models/integration/constants'
import {
    duplicatedHiddenFacebookMessage,
    message,
} from 'models/ticket/tests/mocks'
import { MessageMetadataType, TicketMessage } from 'models/ticket/types'
import Avatar from 'pages/common/components/Avatar/Avatar'

import Container from '../Container'
import Header from '../Header'
import SourceDetailsHeader from '../SourceDetailsHeader'

const customer = fromJS({
    integrations: {
        15: {
            __integration_type__: 'weirdtype',
            customer: {
                foo: 'bar',
            },
        },
    },
})

jest.mock(
    'pages/common/components/Avatar/Avatar',
    () =>
        ({ badgeColor }: ComponentProps<typeof Avatar>) => (
            <div>
                Avatar
                <div>badgeColor: {badgeColor}</div>
            </div>
        ),
)

jest.mock('pages/tickets/detail/components/TicketMessages/Footer', () => () => (
    <div>Footer</div>
))

jest.mock('pages/tickets/detail/components/TicketMessages/Header', () =>
    jest.fn(({ sourceDetails }) => <div>Header{sourceDetails}</div>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceDetailsHeader',
    () => jest.fn(() => <div>SourceDetailsHeader</div>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner',
    () => jest.fn(() => <div>SimplifiedAIAgentBanner</div>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/AiAgentReasoning',
    () => ({
        AiAgentReasoning: jest.fn(() => <div>AiAgentReasoning</div>),
    }),
)

jest.mock('../Avatar', () => ({ Avatar: () => <div>New Avatar</div> }))

describe('Container', () => {
    const flags = {
        [FeatureFlagKey.TicketThreadRevamp]: false,
        [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: false,
    }
    const props = {
        id: 'some-header',
        hasCursor: false,
        message,
        messages: [message],
        timezone: 'America/Los_Angeles',
        lastMessageDatetimeAfterMount: moment('2017-01-01T12:12:34Z'),
        isMessageHidden: false,
        isMessageDeleted: false,
        isBodyHighlighted: false,
        containsLastCustomerMessage: false,
        customer,
        flags,
    }

    it('should render', () => {
        const { container } = render(<Container {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render container without an avatar because the message is hidden', () => {
        const { queryByText } = render(
            <Container {...props} isMessageHidden={true} />,
        )

        expect(queryByText('Avatar')).not.toBeInTheDocument()
    })
    it('should not render container if message type is signal', () => {
        const signalMessage: TicketMessage = {
            ...message,
            meta: {
                type: MessageMetadataType.Signal,
            },
        }
        const propsWithSignalMessage = {
            ...props,
            message: signalMessage,
            messages: [signalMessage],
        }

        const { queryByTestId } = render(
            <Container {...propsWithSignalMessage} />,
        )

        expect(
            queryByTestId(`ticket-message-${props.message.id}`),
        ).not.toBeInTheDocument()
    })

    it('should render container without an avatar because the message is deleted', () => {
        const { queryByText } = render(
            <Container {...props} isMessageDeleted={true} />,
        )

        expect(queryByText('Avatar')).not.toBeInTheDocument()
    })

    it('should render container with isBodyHighlighted because it should be highlighted', () => {
        const { container } = render(
            <Container {...props} isBodyHighlighted={true} />,
        )

        expect(
            (container.firstChild as Element).classList.contains(
                'ticketMessagesHighlighted',
            ),
        ).toBe(true)
    })

    it('should render container with an avatar because the hidden message is duplicated', () => {
        const { queryByText } = render(
            <Container
                {...props}
                message={duplicatedHiddenFacebookMessage}
                isMessageHidden={true}
            />,
        )

        expect(queryByText('Avatar')).toBeInTheDocument()
    })

    it('should have hasError class if message has failed', () => {
        const failedMessage = {
            ...message,
            failed_datetime: '2017-01-01T12:12:34Z',
        }
        const { container, rerender } = render(<Container {...props} />)

        expect(
            (container.firstChild as Element).classList.contains('hasError'),
        ).toBe(false)

        rerender(<Container {...props} message={failedMessage} />)

        expect(
            (container.firstChild as Element).classList.contains('hasError'),
        ).toBe(true)
    })

    it("should define a badge color when it's the last message of customer and from chat", () => {
        const { getByText } = render(
            <Container
                {...props}
                customer={fromJS({
                    integrations: {
                        15: {
                            __integration_type__: IntegrationType.GorgiasChat,
                            chat_recent_activity_timestamp:
                                '2023-12-27T21:25:54.790Z',
                        },
                    },
                })}
                containsLastCustomerMessage
            />,
        )

        expect(getByText('Avatar')).toMatchSnapshot()
    })

    it('should call Header with the correct props', () => {
        render(<Container {...props} />)

        expect(Header).toHaveBeenCalledWith(
            expect.objectContaining({
                message: props.message,
                sourceDetails: expect.any(Object),
            }),
            expect.any(Object),
        )
        expect(SourceDetailsHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                message: props.message,
            }),
            expect.any(Object),
        )
    })

    it('should render AiAgentReasoning when showAiReasoning feature flag is true and message is from AI agent', () => {
        // AI reasoning has priority over simplified banner
        const aiAgentFlags = {
            [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: true,
            [FeatureFlagKey.ShowAiReasoningInTicket]: true,
        }

        const { getByText } = render(
            <Container
                {...props}
                flags={aiAgentFlags}
                isAIAgentMessage={true}
                isTicketAfterFeedbackCollectionPeriod={true}
            />,
        )

        expect(getByText('AiAgentReasoning')).toBeInTheDocument()
    })

    it('should render SimplifiedAIAgentBanner when showAiReasoning feature flag is false and message is from AI agent', () => {
        const aiAgentFlags = {
            [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: true,
            [FeatureFlagKey.ShowAiReasoningInTicket]: false,
        }

        const { getByText } = render(
            <Container
                {...props}
                flags={aiAgentFlags}
                isAIAgentMessage={true}
                isTicketAfterFeedbackCollectionPeriod={true}
            />,
        )

        expect(getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
    })

    it('should render the new avatar if the ticket thread revamp flag is enabled', () => {
        render(
            <Container
                {...props}
                flags={{ ...flags, [FeatureFlagKey.TicketThreadRevamp]: true }}
            />,
        )

        expect(screen.getByText('New Avatar')).toBeInTheDocument()
    })
})
