import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { InfobarTabs } from '../InfobarTabs'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock
const useHistoryMock = useHistory as jest.Mock
const useLocationMock = useLocation as jest.Mock

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn(),
}))
const useHelpdeskV2MS1FlagMock = useHelpdeskV2MS1Flag as jest.Mock

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))
const logEventMock = logEvent as jest.Mock

const mockPush = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    useHistoryMock.mockReturnValue({ push: mockPush })
    useLocationMock.mockReturnValue({ pathname: '/app/ticket/123' })
    useParamsMock.mockReturnValue({ ticketId: '123', customerId: undefined })
    useHelpdeskV2MS1FlagMock.mockReturnValue(false)
})

describe('<InfobarTabs/>', () => {
    it('should render tabs when there are 2 or more widgets', () => {
        const widgetNames = ['widget1', 'widget2']
        render(<InfobarTabs widgetNames={widgetNames} />)

        expect(
            screen.getByRole('link', { name: 'widget1' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'widget2' }),
        ).toBeInTheDocument()
    })

    it('should not render if there is only one widget or less', () => {
        const widgetNames = ['widget1']
        const { container } = render(<InfobarTabs widgetNames={widgetNames} />)
        expect(container.firstChild).toBeNull()
    })

    describe('edit widgets button', () => {
        it('should not render the edit button when useHelpdeskV2MS1Flag is false', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(false)

            render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

            expect(
                screen.queryByRole('button', { name: /settings/i }),
            ).not.toBeInTheDocument()
        })

        it('should render the edit button when useHelpdeskV2MS1Flag is true', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)

            render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        describe('when on ticket page', () => {
            beforeEach(() => {
                useParamsMock.mockReturnValue({
                    ticketId: '456',
                    customerId: undefined,
                })
                useHelpdeskV2MS1FlagMock.mockReturnValue(true)
            })

            it('should navigate to edit-widgets when clicking the button', async () => {
                const user = userEvent.setup()
                useLocationMock.mockReturnValue({ pathname: '/app/ticket/456' })

                render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

                await user.click(screen.getByRole('button'))

                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.InfobarEditWidgetsClicked,
                )
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ticket/456/edit-widgets',
                )
            })

            it('should navigate back to ticket page when clicking the button while editing', async () => {
                const user = userEvent.setup()
                useLocationMock.mockReturnValue({
                    pathname: '/app/ticket/456/edit-widgets',
                })

                render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

                await user.click(screen.getByRole('button'))

                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.InfobarEditWidgetsClicked,
                )
                expect(mockPush).toHaveBeenCalledWith('/app/ticket/456')
            })
        })

        describe('when on customer page', () => {
            beforeEach(() => {
                useParamsMock.mockReturnValue({
                    ticketId: undefined,
                    customerId: '789',
                })
                useHelpdeskV2MS1FlagMock.mockReturnValue(true)
            })

            it('should navigate to edit-widgets when clicking the button', async () => {
                const user = userEvent.setup()
                useLocationMock.mockReturnValue({
                    pathname: '/app/customer/789',
                })

                render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

                await user.click(screen.getByRole('button'))

                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.InfobarEditWidgetsClicked,
                )
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/customer/789/edit-widgets',
                )
            })

            it('should navigate back to customer page when clicking the button while editing', async () => {
                const user = userEvent.setup()
                useLocationMock.mockReturnValue({
                    pathname: '/app/customer/789/edit-widgets',
                })

                render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

                await user.click(screen.getByRole('button'))

                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.InfobarEditWidgetsClicked,
                )
                expect(mockPush).toHaveBeenCalledWith('/app/customer/789')
            })
        })

        it('should not navigate when neither ticketId nor customerId is present', async () => {
            const user = userEvent.setup()
            useParamsMock.mockReturnValue({
                ticketId: undefined,
                customerId: undefined,
            })
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)

            render(<InfobarTabs widgetNames={['widget1', 'widget2']} />)

            await user.click(screen.getByRole('button'))

            expect(logEventMock).not.toHaveBeenCalled()
            expect(mockPush).not.toHaveBeenCalled()
        })
    })
})
