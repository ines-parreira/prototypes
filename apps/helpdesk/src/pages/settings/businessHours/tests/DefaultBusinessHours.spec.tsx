import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAccountSettingsHandler,
    mockUpdateAccountSettingHandler,
} from '@gorgias/helpdesk-mocks'
import {
    AccountSettingsItem,
    BusinessHoursTimeframe,
} from '@gorgias/helpdesk-types'

import { useAppNode } from 'appNode'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, renderWithStore } from 'utils/testing'

import DefaultBusinessHours from '../DefaultBusinessHours'

jest.mock('appNode')
const mockUseAppNode = assumeMock(useAppNode)

jest.mock('hooks/useAppDispatch')

jest.mock('state/notifications/actions')

jest.mock('pages/common/components/FormUnsavedChangesPrompt', () => () => (
    <div>Form Unsaved Changes Prompt</div>
))

const mockBusinessHoursData: AccountSettingsItem = {
    id: 1,
    type: 'business-hours',
    data: {
        timezone: 'US/Pacific',
        business_hours: [
            {
                days: '1,2,3,4,5',
                from_time: '09:00',
                to_time: '17:00',
            },
        ] as BusinessHoursTimeframe[],
    },
}

const queryClient = mockQueryClient()
const server = setupServer()

const updateAccountSettingMock = mockUpdateAccountSettingHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    const listAccountSettingsMock = mockListAccountSettingsHandler(async () => {
        return HttpResponse.json({
            data: [mockBusinessHoursData],
        })
    })
    server.use(
        listAccountSettingsMock.handler,
        updateAccountSettingMock.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

describe('<DefaultBusinessHours />', () => {
    let mockAppNode: HTMLElement

    beforeEach(() => {
        mockAppNode = document.createElement('div')
        document.body.appendChild(mockAppNode)
        mockUseAppNode.mockReturnValue(mockAppNode as any)
    })

    afterEach(() => {
        document.body.removeChild(mockAppNode)
        jest.clearAllMocks()
        queryClient.clear()
    })

    const renderComponent = () => {
        return renderWithStore(
            <QueryClientProvider client={queryClient}>
                <DefaultBusinessHours />
            </QueryClientProvider>,
            {},
        )
    }

    it('should render the component with business hours data', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByText('Default Business Hours'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                'These hours serve as the default schedule used across Gorgias for all integrations where no custom hours are defined. If not specified, availability defaults to 24/7 (always on).',
            ),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('US/Pacific')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.getByText('Mon-Fri, 9:00 AM-5:00 PM'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByLabelText('Edit default business hours'),
        ).toBeInTheDocument()
    })

    it('should handle loading state', async () => {
        renderComponent()

        expect(screen.queryByText('US/Pacific')).not.toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('US/Pacific')).toBeInTheDocument()
        })
    })

    it('should handle when there is no business hours data', () => {
        const listAccountSettingsMock = mockListAccountSettingsHandler(
            async () =>
                HttpResponse.json({
                    data: [],
                }),
        )
        server.use(listAccountSettingsMock.handler)

        renderComponent()

        expect(screen.getByText('Default Business Hours')).toBeInTheDocument()

        expect(
            screen.getByText(
                'These hours serve as the default schedule used across Gorgias for all integrations where no custom hours are defined. If not specified, availability defaults to 24/7 (always on).',
            ),
        ).toBeInTheDocument()
    })

    it('should open the drawer when edit button is clicked', async () => {
        renderComponent()

        await act(async () => {
            await userEvent.click(
                screen.getByLabelText('Edit default business hours'),
            )
        })

        await waitFor(() => {
            expect(
                screen.getByText('Edit default business hours'),
            ).toBeInTheDocument()

            expect(screen.getByText(/Timezone/)).toBeInTheDocument()
            expect(screen.getByText(/Schedule/)).toBeInTheDocument()
            expect(screen.getByText('Save changes')).toBeInTheDocument()
            expect(screen.getByText('Cancel')).toBeInTheDocument()
        })
    })

    it('should have proper aria labels', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByLabelText('Edit default business hours'),
            ).toBeInTheDocument()
        })
    })
})
