import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockBusinessHoursDetails,
    mockUpdateBusinessHoursHandler,
} from '@gorgias/helpdesk-mocks'

import history from 'pages/history'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { BUSINESS_HOURS_BASE_URL } from '../constants'
import CustomBusinessHoursProvider from '../CustomBusinessHoursProvider'
import EditCustomBusinessHoursForm from '../EditCustomBusinessHoursForm'

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}

jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const mockUpdateBusinessHours = mockUpdateBusinessHoursHandler()

beforeEach(() => {
    server.use(mockUpdateBusinessHours.handler)
})

afterEach(() => {
    server.resetHandlers()
})

const businessHours = mockBusinessHoursDetails({
    business_hours_config: {
        timezone: 'America/New_York',
        business_hours: [
            {
                days: '3',
                from_time: '09:00',
                to_time: '17:00',
            },
            {
                days: '4',
                from_time: '10:00',
                to_time: '18:00',
            },
        ],
    },
})

const renderComponent = () => {
    return renderWithStoreAndQueryClientAndRouter(
        <CustomBusinessHoursProvider businessHoursId={businessHours.id}>
            <EditCustomBusinessHoursForm businessHours={businessHours} />
        </CustomBusinessHoursProvider>,
        {},
    )
}

describe('EditCustomBusinessHoursForm', () => {
    it('renders the form with all sections and action buttons', () => {
        renderComponent()

        expect(screen.getByText('General')).toBeInTheDocument()
        expect(screen.getByText('Schedule')).toBeInTheDocument()
        expect(screen.getByText('Integrations')).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Save changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete business hours' }),
        ).toBeInTheDocument()
    })

    it('renders the form with all fields', () => {
        renderComponent()

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Timezone')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add time range' }),
        ).toBeInTheDocument()
    })

    it('should pre-populate the form with the business hours details', () => {
        renderComponent()

        expect(screen.getByLabelText(/Name/)).toHaveValue(businessHours.name)
        expect(screen.getByText('America/New_York')).toBeInTheDocument()
        expect(screen.getByText('Wednesday')).toBeInTheDocument()
        expect(screen.getByText('Thursday')).toBeInTheDocument()
        expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('17:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
        expect(screen.getByDisplayValue('18:00')).toBeInTheDocument()
    })

    it('should handle form submission successfully', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () =>
            user.type(screen.getByLabelText(/Name/), 'New Name'),
        )
        await act(async () =>
            user.click(screen.getByRole('button', { name: 'Save changes' })),
        )

        expect(mockNotify.success).toHaveBeenCalledWith(
            `'${mockUpdateBusinessHours.data.name}' business hours were successfully updated.`,
        )
        expect(history.push).toHaveBeenCalledWith(BUSINESS_HOURS_BASE_URL)
    })

    it('should call errorNotify when the form is submitted with invalid data', async () => {
        const user = userEvent.setup()
        const mockUpdateBusinessHoursError = mockUpdateBusinessHoursHandler(
            async ({ data }) =>
                HttpResponse.json(
                    { ...data },
                    {
                        status: 500,
                    },
                ),
        )
        server.use(mockUpdateBusinessHoursError.handler)

        renderComponent()

        await act(async () =>
            user.type(screen.getByLabelText(/Name/), 'New Name'),
        )
        await act(async () =>
            user.click(screen.getByRole('button', { name: 'Save changes' })),
        )

        expect(mockNotify.error).toHaveBeenCalledWith(
            "We couldn't save your preferences. Please try again.",
        )
    })
})
