import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'immutable'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
} from 'models/integration/types'

import * as hookGorgiasChatIntegrationStatusData from '../../../../../../hooks/useGorgiasChatIntegrationStatusData'
import { StatusCell } from './StatusCell'

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

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
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

            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
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
            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
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

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Online')).toBeInTheDocument()
        })

        it('should render Installed status with green tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.INSTALLED,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Installed')).toBeInTheDocument()
        })

        it('should render Offline status with grey tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.OFFLINE,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Offline')).toBeInTheDocument()
        })

        it('should render Hidden status with grey tag', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Hidden')).toBeInTheDocument()
        })

        it('should render Hidden status with grey tag for HIDDEN_OUTSIDE_BUSINESS_HOURS', () => {
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Hidden')).toBeInTheDocument()
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

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Not installed')).toBeInTheDocument()
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

            render(<StatusCell chat={chat} loading={loading} />)

            expect(screen.getByText('Not detected')).toBeInTheDocument()
        })
    })

    describe('conditional tooltip rendering', () => {
        it('should render tooltip for HIDDEN_OUTSIDE_BUSINESS_HOURS status', async () => {
            const user = userEvent.setup()
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            await user.tab()

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(/Chat is/i)
            expect(tooltip).toHaveTextContent(/hidden outside/i)
            expect(tooltip).toHaveTextContent(/business hours/i)
        })

        it('should render link to preferences for HIDDEN_OUTSIDE_BUSINESS_HOURS', async () => {
            const user = userEvent.setup()
            mockUseGorgiasChatIntegrationStatusData.mockReturnValue({
                chatStatus: GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
                isChatStatusLoading: false,
                isChatStatusError: false,
            })

            const chat = createChatMap()
            const loading = createLoadingMap()

            render(<StatusCell chat={chat} loading={loading} />)

            await user.tab()

            const link = await screen.findByRole('link', {
                name: /hidden outside/i,
            })
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/channels/gorgias_chat/123/preferences',
            )
        })

        it('should render tooltip for NOT_INSTALLED status with Published wizard', async () => {
            const user = userEvent.setup()
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

            await user.tab()

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(
                /We couldn't detect the chat widget on your website in the last 72 hours/i,
            )
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
