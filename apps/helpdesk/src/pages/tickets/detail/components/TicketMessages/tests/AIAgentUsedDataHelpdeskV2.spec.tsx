import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'

import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import {
    getActionUrl,
    getGuidanceUrl,
    getKnowledgeUrl,
} from '../../AIAgentFeedbackBar/utils'
import { AIAgentUsedDataHelpdeskV2 } from '../AIAgentDraftMessageHelpdeskV2/AIAgentUsedDataHelpdeskV2'

jest.mock('hooks/useHasAgentPrivileges')
jest.mock('models/aiAgentFeedback/queries')
jest.mock('../../AIAgentFeedbackBar/utils', () => ({
    getActionUrl: jest.fn(() => 'https://example.com/action'),
    getGuidanceUrl: jest.fn(() => 'https://example.com/guidance'),
    getKnowledgeUrl: jest.fn(() => 'https://example.com/knowledge'),
}))

const useHasAgentPrivilegesMock = assumeMock(useHasAgentPrivileges)
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const getActionUrlMock = assumeMock(getActionUrl)
const getGuidanceUrlMock = assumeMock(getGuidanceUrl)
const getKnowledgeUrlMock = assumeMock(getKnowledgeUrl)

describe('AIAgentUsedDataHelpdeskV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        useHasAgentPrivilegesMock.mockReturnValue(true)
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
        } as never)
    })

    it('renders nothing when there is no matching feedback data', () => {
        const { container } = render(
            <AIAgentUsedDataHelpdeskV2 messageId={1} />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(screen.queryByText('Data Used')).not.toBeInTheDocument()
    })

    it('renders nothing when feedback exists but every data bucket is empty', () => {
        const { container } = render(
            <AIAgentUsedDataHelpdeskV2
                messageId={messageFeedback.messageId}
                messageFeedback={{
                    ...messageFeedback,
                    orders: [],
                    actions: [],
                    guidance: [],
                    knowledge: [],
                }}
            />,
        )

        expect(container).toBeEmptyDOMElement()
        expect(screen.queryByText('Data Used')).not.toBeInTheDocument()
    })

    it('renders orders, actions, guidance, and knowledge from the provided feedback', async () => {
        const user = userEvent.setup()
        render(
            <AIAgentUsedDataHelpdeskV2
                messageId={messageFeedback.messageId}
                messageFeedback={messageFeedback}
            />,
        )

        expect(screen.getByText('Data Used')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /data used/i }))

        expect(screen.getByRole('link', { name: /#3324/ })).toHaveAttribute(
            'href',
            'https://gorgias.com',
        )
        expect(
            screen.getByRole('link', { name: /get loyalty points/i }),
        ).toHaveAttribute('href', 'https://example.com/action')
        expect(
            screen.getByRole('link', { name: /cancelling an order/i }),
        ).toHaveAttribute('href', 'https://example.com/guidance')
        expect(
            screen.getByRole('link', { name: /refund policy/i }),
        ).toHaveAttribute('href', 'https://example.com/knowledge')

        expect(getActionUrlMock).toHaveBeenCalledWith(
            messageFeedback.actions?.[0],
            messageFeedback.shopType,
            messageFeedback.shopName,
        )
        expect(getGuidanceUrlMock).toHaveBeenCalledWith(
            messageFeedback.guidance?.[0],
            messageFeedback.shopType,
            messageFeedback.shopName,
        )
        expect(getKnowledgeUrlMock).toHaveBeenCalledWith(
            messageFeedback.knowledge?.[0],
            messageFeedback.shopType,
            messageFeedback.shopName,
        )
    })

    it('falls back to queried feedback and omits privileged URLs when needed', async () => {
        const user = userEvent.setup()
        useHasAgentPrivilegesMock.mockReturnValue(false)
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [messageFeedback],
                },
            },
        } as never)

        render(
            <AIAgentUsedDataHelpdeskV2 messageId={messageFeedback.messageId} />,
        )

        expect(screen.getByText('Data Used')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /data used/i }))

        expect(
            screen.getByRole('link', { name: /get shipping address/i }),
        ).not.toHaveAttribute('href')
        expect(
            screen.getByRole('link', { name: /refund external-link/i }),
        ).not.toHaveAttribute('href')
        expect(
            screen.getByRole('link', { name: /shipping times/i }),
        ).not.toHaveAttribute('href')
        expect(screen.getByRole('link', { name: /#3324/ })).toHaveAttribute(
            'href',
            'https://gorgias.com',
        )
    })
})
