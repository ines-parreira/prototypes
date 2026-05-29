import { assumeMock, render } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUser,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { UserStatusIndicator } from '../UserStatusIndicator'

vi.mock('@gorgias/realtime')

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)

const ALICE = mockUser({ id: 1, name: 'Alice' })

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })

    const { handler } = mockListUserAvailabilitiesHandler(async () =>
        HttpResponse.json(
            mockListUserAvailabilitiesResponse({
                data: [],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: null,
                },
            }),
        ),
    )
    server.use(handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const useOnlineAvailability = (availabilities: UserAvailability[]) => {
    useAgentsOnlineStatusMock.mockReturnValue({
        onlineAgents: { 1: ALICE },
    })
    const { handler } = mockListUserAvailabilitiesHandler(async () =>
        HttpResponse.json(
            mockListUserAvailabilitiesResponse({
                data: availabilities,
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: null,
                },
            }),
        ),
    )
    server.use(handler)
}

describe('UserStatusIndicator', () => {
    it('renders a grey, Offline-labeled indicator when the user is not in onlineAgents', () => {
        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()
        expect(
            container.querySelector('[data-color="grey"]'),
        ).toBeInTheDocument()
    })

    it('renders a green, Online-labeled indicator when online without availability data', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: ALICE },
        })

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        expect(getByRole('img', { name: 'Online' })).toBeInTheDocument()
        expect(
            container.querySelector('[data-color="green"]'),
        ).toBeInTheDocument()
    })

    it('renders a green, Available-labeled indicator when online and chosen status is available', async () => {
        useOnlineAvailability([
            mockUserAvailability({ user_id: 1, user_status: 'available' }),
        ])

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        await waitFor(() => {
            expect(getByRole('img', { name: 'Available' })).toBeInTheDocument()
        })
        expect(
            container.querySelector('[data-color="green"]'),
        ).toBeInTheDocument()
    })

    it('renders an orange, Unavailable-labeled indicator when online and chosen status is unavailable', async () => {
        useOnlineAvailability([
            mockUserAvailability({ user_id: 1, user_status: 'unavailable' }),
        ])

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        await waitFor(() => {
            expect(
                getByRole('img', { name: 'Unavailable' }),
            ).toBeInTheDocument()
        })
        expect(
            container.querySelector('[data-color="orange"]'),
        ).toBeInTheDocument()
    })

    it('renders an orange, Unavailable-labeled indicator when online and chosen status is custom', async () => {
        useOnlineAvailability([
            mockUserAvailability({ user_id: 1, user_status: 'custom' }),
        ])

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        await waitFor(() => {
            expect(
                getByRole('img', { name: 'Unavailable' }),
            ).toBeInTheDocument()
        })
        expect(
            container.querySelector('[data-color="orange"]'),
        ).toBeInTheDocument()
    })

    it('stays grey when the user is offline even if availability says unavailable', async () => {
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [
                        mockUserAvailability({
                            user_id: 1,
                            user_status: 'unavailable',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()
        expect(
            container.querySelector('[data-color="grey"]'),
        ).toBeInTheDocument()
    })

    it('reflects presence changes without remount', () => {
        const { getByRole, rerender } = render(
            <UserStatusIndicator user={ALICE} />,
        )
        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()

        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: ALICE },
        })
        rerender(<UserStatusIndicator user={ALICE} />)

        expect(getByRole('img', { name: 'Online' })).toBeInTheDocument()
    })

    it('renders nothing when the user has no id', () => {
        const { container } = render(
            <UserStatusIndicator
                user={mockUser({ id: undefined, name: 'Anon' })}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
