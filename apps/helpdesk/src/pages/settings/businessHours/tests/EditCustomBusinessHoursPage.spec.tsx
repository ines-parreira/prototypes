import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetBusinessHoursDetailsHandler } from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import EditCustomBusinessHoursPage from '../EditCustomBusinessHoursPage'

jest.mock('../EditCustomBusinessHoursForm', () => () => (
    <div>EditCustomBusinessHoursForm</div>
))

const mockedGetBusinessHoursDetails = mockGetBusinessHoursDetailsHandler(
    async ({ request: __req, data }) =>
        HttpResponse.json({ ...data, id: 123, name: 'CBH' }, { status: 200 }),
)

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

beforeEach(() => {
    server.use(mockedGetBusinessHoursDetails.handler)
})

afterEach(() => {
    server.resetHandlers()
})

describe('EditCustomBusinessHoursPage', () => {
    it('renders loading when fetching', () => {
        const { container } = renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursPage />,
            {},
            {
                route: '/123',
                path: '/:id',
            },
        )

        expect(
            container.getElementsByClassName('md-spin')[0],
        ).toBeInTheDocument()
    })

    it('renders error when fetching fails and retries when refresh is clicked', async () => {
        const getBusinessHoursErrorMock = mockGetBusinessHoursDetailsHandler(
            async ({ request: __req, data }) =>
                HttpResponse.json(data, { status: 500 }),
        )
        server.use(getBusinessHoursErrorMock.handler)
        const user = userEvent.setup()

        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursPage />,
            {},
            {
                route: '/123',
                path: '/:id',
            },
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Something went wrong while fetching the data. Please try again.',
                ),
            ).toBeInTheDocument()
        })

        server.use(mockedGetBusinessHoursDetails.handler)

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Refresh' })),
        )

        await waitFor(() => {
            expect(
                screen.getByText('EditCustomBusinessHoursForm'),
            ).toBeInTheDocument()
        })
    })

    it('renders the page with breadcrumbs and form', async () => {
        renderWithStoreAndQueryClientAndRouter(
            <EditCustomBusinessHoursPage />,
            {},
            {
                route: '/123',
                path: '/:id',
            },
        )

        await waitFor(() => {
            expect(screen.getByText('Business hours')).toBeInTheDocument()

            expect(screen.getByText('Edit CBH')).toBeInTheDocument()

            expect(
                screen.getByText('EditCustomBusinessHoursForm'),
            ).toBeInTheDocument()
        })
    })
})
