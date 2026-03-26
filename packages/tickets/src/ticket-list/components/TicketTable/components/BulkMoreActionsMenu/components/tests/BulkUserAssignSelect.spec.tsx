import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListUsersHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import {
    render,
    testAppQueryClient,
} from '../../../../../../../tests/render.utils'
import { BulkUserAssignSelect } from '../BulkUserAssignSelect'

const currentUser = mockUser({ id: 99, name: 'Current User' })
const user1 = mockUser({ id: 1, name: 'Alice' })
const user2 = mockUser({ id: 2, name: 'Bob' })

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(currentUser),
)

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [user1, user2],
        meta: { prev_cursor: null, next_cursor: null },
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetCurrentUser.handler, mockListUsers.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    let trigger: HTMLElement = {} as HTMLElement
    await waitFor(() => {
        const elements = screen.getAllByLabelText('Assign agent')
        expect(elements[0]).not.toBeDisabled()
        trigger = elements[0]
    })
    return trigger
}

const renderBulkUserAssignSelect = ({
    onChange = vi.fn(),
    isOpen = false,
    onOpenChange = vi.fn(),
}: {
    onChange?: (typeof BulkUserAssignSelect extends (props: infer P) => unknown
        ? P
        : never)['onChange']
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) =>
    render(
        <BulkUserAssignSelect
            onChange={onChange}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        />,
    )

describe('BulkUserAssignSelect', () => {
    it('calls onChange with the selected user', async () => {
        const onChange = vi.fn()
        const { user } = renderBulkUserAssignSelect({
            onChange,
            isOpen: true,
        })

        await waitUntilLoaded()

        const aliceOptions = await screen.findAllByText('Alice')
        await user.click(aliceOptions[aliceOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: 'Alice' }),
        )
    })

    it('clears search when dropdown is closed', async () => {
        const onOpenChange = vi.fn()
        const { user, rerender } = renderBulkUserAssignSelect({
            isOpen: true,
            onOpenChange,
        })

        const trigger = await waitUntilLoaded()

        const searchInput = await screen.findByRole('searchbox')
        await user.type(searchInput, 'Ali')
        expect(searchInput).toHaveValue('Ali')

        await user.click(trigger)
        expect(onOpenChange).toHaveBeenCalledWith(false)

        rerender(
            <BulkUserAssignSelect
                onChange={vi.fn()}
                isOpen={false}
                onOpenChange={onOpenChange}
            />,
        )
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        rerender(
            <BulkUserAssignSelect
                onChange={vi.fn()}
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )
        expect(await screen.findByRole('searchbox')).toHaveValue('')
    })
})
