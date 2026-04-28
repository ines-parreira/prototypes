import type { ReactNode } from 'react'

import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'

import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import {
    getActionUrl,
    getGuidanceUrl,
    getKnowledgeUrl,
} from '../../AIAgentFeedbackBar/utils'
import { AIAgentUsedDataHelpdeskV2 } from '../AIAgentDraftMessageHelpdeskV2/AIAgentUsedDataHelpdeskV2'

jest.mock('@gorgias/axiom', () => ({
    Box: ({
        children,
        className,
    }: {
        children?: ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Disclosure: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    DisclosureHeader: ({
        title,
    }: {
        title?: ReactNode | ((args: { isExpanded: boolean }) => ReactNode)
    }) => (
        <div>
            {typeof title === 'function' ? title({ isExpanded: false }) : title}
        </div>
    ),
    DisclosurePanel: ({ children }: { children?: ReactNode }) => (
        <div>{children}</div>
    ),
    DropdownIcon: ({ isOpen }: { isOpen: boolean }) => (
        <span>{isOpen ? 'open' : 'closed'}</span>
    ),
    Icon: ({ name }: { name: string }) => <span>{name}</span>,
    Link: ({ children, href }: { children?: ReactNode; href?: string }) => (
        <a href={href}>{children}</a>
    ),
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}))

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

    it('renders orders, actions, guidance, and knowledge from the provided feedback', () => {
        render(
            <AIAgentUsedDataHelpdeskV2
                messageId={messageFeedback.messageId}
                messageFeedback={messageFeedback}
            />,
        )

        expect(screen.getByText('Data Used')).toBeInTheDocument()
        expect(screen.getByText('#3324').closest('a')).toHaveAttribute(
            'href',
            'https://gorgias.com',
        )
        expect(
            screen.getByText('Get loyalty points').closest('a'),
        ).toHaveAttribute('href', 'https://example.com/action')
        expect(
            screen.getByText('Cancelling an order').closest('a'),
        ).toHaveAttribute('href', 'https://example.com/guidance')
        expect(screen.getByText('Refund Policy').closest('a')).toHaveAttribute(
            'href',
            'https://example.com/knowledge',
        )

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

    it('falls back to queried feedback and omits privileged URLs when needed', () => {
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
        expect(
            screen.getByText('Get shipping address').closest('a'),
        ).not.toHaveAttribute('href')
        expect(screen.getByText('Refund').closest('a')).not.toHaveAttribute(
            'href',
        )
        expect(
            screen.getByText('Shipping times').closest('a'),
        ).not.toHaveAttribute('href')
        expect(screen.getByText('#3324').closest('a')).toHaveAttribute(
            'href',
            'https://gorgias.com',
        )
    })
})
