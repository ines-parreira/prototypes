import type React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
} from 'models/integration/types'

import * as hookGorgiasChatIntegrationStatusData from '../../../../../../hooks/useGorgiasChatIntegrationStatusData'
import { StatusCell } from './StatusCell'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <span role="status" />,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
    NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))

describe('StatusCell', () => {
    const mockUseGorgiasChatIntegrationStatusData = jest.spyOn(
        hookGorgiasChatIntegrationStatusData,
        'useGorgiasChatIntegrationStatusData',
    )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const createChatMap = (overrides = {}) =>
        Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
            }),
            ...overrides,
        })

    const createLoadingMap = (overrides = {}) =>
        Map({
            integrations: false,
            ...overrides,
        })

    describe('loading and error states', () => {
        it('should display skeleton when integrations are loading', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: undefined,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap({ integrations: true })

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('should display skeleton when chat status is loading', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: undefined,
                isChatStatusLoading: true,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('should display error text when chat status fetch fails', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: undefined,
                isChatStatusLoading: false,
                isChatStatusError: true,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Status unavailable')).toBeInTheDocument()
        })

        it('should display skeleton when chat status is not yet available', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: undefined,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.queryByText('Online')).not.toBeInTheDocument()
            expect(screen.queryByText('Offline')).not.toBeInTheDocument()
            expect(screen.getByRole('status')).toBeInTheDocument()
        })
    })

    describe('status tag rendering', () => {
        it('should render Online status with green tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.ONLINE,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Online')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="green"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Installed status with green tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Installed')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="green"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Offline status with grey tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.OFFLINE,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Offline')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="grey"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Hidden status with grey tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Hidden')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="grey"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Hidden status with grey tag for HIDDEN_OUTSIDE_BUSINESS_HOURS', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Hidden')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="grey"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Not installed status with red tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap({
                meta: Map({
                    wizard: Map({
                        status: GorgiasChatCreationWizardStatus.Draft,
                    }),
                }),
            })
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Not installed')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="red"]')
            expect(tag).toBeInTheDocument()
        })

        it('should render Not detected status with orange tag for NOT_INSTALLED with Published wizard', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap({
                meta: Map({
                    wizard: Map({
                        status: GorgiasChatCreationWizardStatus.Published,
                    }),
                }),
            })
            const loading = createLoadingMap()

            const { container } = render(
                <StatusCell chat={chat} loading={loading} />,
            )

            expect(screen.getByText('Not detected')).toBeInTheDocument()

            const tag = container.querySelector('[data-color="orange"]')
            expect(tag).toBeInTheDocument()
        })
    })

    describe('conditional tooltip rendering', () => {
        it('should render tooltip for HIDDEN_OUTSIDE_BUSINESS_HOURS status', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText(/Chat is/i)).toBeInTheDocument()
            expect(screen.getByText(/hidden outside/i)).toBeInTheDocument()
            expect(screen.getByText(/business hours/i)).toBeInTheDocument()
        })

        it('should render link to preferences for HIDDEN_OUTSIDE_BUSINESS_HOURS', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            const link = screen.getByText(/hidden outside/i).closest('a')
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/channels/gorgias_chat/123/preferences',
            )
        })

        it('should render tooltip for NOT_INSTALLED status with Published wizard', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap({
                meta: Map({
                    wizard: Map({
                        status: GorgiasChatCreationWizardStatus.Published,
                    }),
                }),
            })
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(
                screen.getByText(
                    /We couldn't detect the chat widget on your website in the last 72 hours/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render Not detected status for NOT_INSTALLED with Published wizard', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.NOT_INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap({
                meta: Map({
                    wizard: Map({
                        status: GorgiasChatCreationWizardStatus.Published,
                    }),
                }),
            })
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Not detected')).toBeInTheDocument()
        })

        it('should not render tooltip for ONLINE status', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.ONLINE,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.queryByText(/Chat is/i)).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Chat Widget was not seen/i),
            ).not.toBeInTheDocument()
        })
    })
})
