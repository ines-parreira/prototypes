import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useParams } from 'react-router-dom'

import {
    mockBulkArchiveMacrosHandler,
    mockBulkUnarchiveMacrosHandler,
    mockCreateMacroHandler,
    mockDeleteMacroHandler,
    mockGetMacroHandler,
    mockMacro,
    mockUpdateMacroHandler,
} from '@gorgias/helpdesk-mocks'
import { Macro } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import history from 'pages/history'
import { MacroEdit } from 'pages/tickets/common/macros/components/MacroEdit'
import { getDefaultMacro } from 'state/macro/utils'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import MacrosSettingsForm from '../MacrosSettingsForm'

const queryClient = mockQueryClient()
const server = setupServer()

jest.mock('pages/history')
jest.mock(
    'pages/common/components/button/ConfirmButton',
    () =>
        ({ children, onConfirm }: ComponentProps<typeof ConfirmButton>) => (
            <div onClick={onConfirm}>{children}</div>
        ),
)
const mockActions = fromJS([
    {
        name: MacroActionName.Http,
    },
    {
        name: MacroActionName.Http,
    },
    {
        name: MacroActionName.AddAttachments,
    },
    {
        name: MacroActionName.AddAttachments,
    },
])
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>LoaderMock</div>
))
jest.mock(
    'pages/tickets/common/macros/components/MacroEdit',
    () =>
        ({ actions, setActions }: ComponentProps<typeof MacroEdit>) => (
            <div onClick={() => setActions(mockActions)}>
                <span>MacroEditMock</span>
                {actions?.toArray().map((action: Map<any, any>, i) => (
                    <span key={i}>{action.get('name') as string}</span>
                ))}
            </div>
        ),
)
jest.mock('hooks/useHasAgentPrivileges')
jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useParams: jest.fn(),
        }) as Record<string, any>,
)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Link: () => <div>Link Mock</div>,
    useLocation: jest.fn(),
    useParams: jest.fn(),
}))
const mockedUseParams = assumeMock(useParams)

jest.mock('state/notifications/actions')

const getMock = mockGetMacroHandler()
const createMock = mockCreateMacroHandler()
const deleteMock = mockDeleteMacroHandler()

const localHandlers = [getMock.handler, createMock.handler, deleteMock.handler]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    render(
        <QueryClientProvider client={queryClient}>
            <MacrosSettingsForm />
        </QueryClientProvider>,
    )

describe('<MacrosSettingsForm />', () => {
    const mockMacroId = 1

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
        useAppSelectorMock.mockReturnValue(fromJS([]))
        useHasAgentPrivilegesMock.mockReturnValue(true)
        mockedUseParams.mockReturnValue({ macroId: mockMacroId.toString() })
    })

    it('should render an empty form when no macro id', () => {
        mockedUseParams.mockReturnValue({})
        renderComponent()

        expect(screen.getByText('Add macro')).toBeInTheDocument()
        expect(screen.getByText('Create macro')).toBeInTheDocument()
        expect(screen.queryByText('Archive macro')).not.toBeInTheDocument()
    })

    it('should display a loader when fetching a macro', async () => {
        const getMock = mockGetMacroHandler()
        server.use(getMock.handler)

        renderComponent()

        expect(screen.getByText('LoaderMock')).toBeInTheDocument()
        await waitFor(() =>
            expect(screen.queryByText('LoaderMock')).not.toBeInTheDocument(),
        )
    })

    it('should render a filled form', async () => {
        const getMock = mockGetMacroHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                archived_datetime: null,
            }),
        )
        server.use(getMock.handler)

        renderComponent()

        await waitFor(() =>
            expect(screen.queryByText('LoaderMock')).not.toBeInTheDocument(),
        )
        expect(screen.getByText('Update macro')).toBeInTheDocument()
        expect(screen.getByText('Duplicate macro')).toBeInTheDocument()
        expect(screen.getByText('Delete macro')).toBeInTheDocument()
        expect(screen.queryByText('Archive macro')).toBeInTheDocument()
    })

    it('should notify the user when failed to fetch the macro', async () => {
        const getMock = mockGetMacroHandler(
            async () =>
                new HttpResponse(
                    {
                        error: {
                            msg: 'error message',
                        },
                    } as unknown as null,
                    { status: 500 },
                ),
        )
        server.use(getMock.handler)

        renderComponent()

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                title: 'Failed to fetch macro',
                status: NotificationStatus.Error,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should create macro and redirect to /app/settings/macros', async () => {
        const createMock = mockCreateMacroHandler()
        server.use(createMock.handler)
        const waitForCreate = createMock.waitForRequest(server)

        mockedUseParams.mockReturnValue({})
        renderComponent()

        screen.getByText('Create macro').click()

        await waitForCreate(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ...getDefaultMacro(),
                language: null,
            })
        })

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should update macro and redirect to app/settings/macros', async () => {
        const getMock = mockGetMacroHandler(async ({ data }) => {
            return HttpResponse.json({
                ...data,
                id: mockMacroId,
            })
        })

        const updateMock = mockUpdateMacroHandler()
        server.use(getMock.handler)
        server.use(updateMock.handler)
        const waitForUpdate = updateMock.waitForRequest(server)

        renderComponent()

        await waitFor(() =>
            expect(screen.queryByText('LoaderMock')).not.toBeInTheDocument(),
        )

        screen.getByText('Update macro').click()

        await waitForUpdate(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ...getMock.data,
                id: mockMacroId,
                actions: [],
            })
        })

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully updated macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should remove empty custom field macro', async () => {
        const macroActions = [
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 1,
                    value: 'ok',
                },
            },
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 2,
                    value: 'ok',
                },
            },
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 3,
                    value: '',
                },
            },
        ]

        const customFieldsMacro = mockMacro({
            actions: macroActions,
        })

        const getMock = mockGetMacroHandler(async () =>
            HttpResponse.json(customFieldsMacro),
        )
        const updateMock = mockUpdateMacroHandler()
        server.use(getMock.handler)
        server.use(updateMock.handler)
        const waitForUpdate = updateMock.waitForRequest(server)

        renderComponent()

        await waitFor(() =>
            expect(screen.queryByText('LoaderMock')).not.toBeInTheDocument(),
        )

        screen.getByText('Update macro').click()

        await waitForUpdate(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ...customFieldsMacro,
                actions: macroActions.slice(0, 2),
            })
        })

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully updated macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should only trigger submit once when clicked twice quickly', async () => {
        let resolve: (value: HttpResponse<Macro>) => void
        let button: HTMLElement
        mockedUseParams.mockReturnValue({})
        const mockPromise = new Promise<HttpResponse<Macro>>((res) => {
            resolve = res
        })

        const createMock = mockCreateMacroHandler(async () => mockPromise)
        const waitForCreate = createMock.waitForRequest(server)
        server.use(createMock.handler)

        renderComponent()

        await waitFor(() => {
            button = screen.getByRole('button', { name: 'Create macro' })
        })

        // First click triggers submission (will stay pending)
        await act(async () => {
            button.click()
        })

        // Second click happens while still "submitting"
        await act(async () => {
            button.click()
        })

        // Resolve the async operation manually
        act(() => {
            resolve(HttpResponse.json(mockMacro()))
        })

        await waitForCreate(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ...getDefaultMacro(),
                language: null,
            })
        })

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should delete macro and redirect to /app/settings/macros', async () => {
        const deleteMock = mockDeleteMacroHandler()
        server.use(deleteMock.handler)
        const waitForDelete = deleteMock.waitForRequest(server)

        renderComponent()

        await waitFor(() => {
            screen.getByText('Delete macro').click()
        })

        await waitForDelete(async () => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully deleted macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should duplicate macro and redirect ', async () => {
        const { name, actions, language } = getMock.data
        const waitForCreate = createMock.waitForRequest(server)

        renderComponent()

        await waitFor(() => {
            screen.getByText('Duplicate macro').click()
        })

        await waitForCreate(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                name: `(Copy) ${name}`,
                actions,
                language,
            })
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully duplicated macro',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith(
                `/app/settings/macros/${createMock.data.id}`,
            )
        })
    })

    it('should notify when failing to duplicate macro', async () => {
        const createMock = mockCreateMacroHandler(
            async () =>
                new HttpResponse({ error: 'error' } as unknown as null, {
                    status: 500,
                }),
        )
        server.use(createMock.handler)

        renderComponent()

        await waitFor(() => {
            screen.getByText('Duplicate macro').click()

            expect(notify).toHaveBeenNthCalledWith(1, {
                title: 'Failed to duplicate macro',
                message: null,
                status: NotificationStatus.Error,
                allowHTML: true,
            })
        })
    })

    it('should update actions of macro form', async () => {
        const getMock = mockGetMacroHandler()
        server.use(getMock.handler)

        renderComponent()

        await waitFor(() => {
            screen.getByText('MacroEditMock').click()
        })

        expect(screen.getAllByText(MacroActionName.Http)).toHaveLength(2)
        expect(
            screen.getByText(MacroActionName.AddAttachments),
        ).toBeInTheDocument()
    })

    it('should archive macro', async () => {
        const archiveMock = mockBulkArchiveMacrosHandler()
        const getMock = mockGetMacroHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                archived_datetime: null,
            }),
        )
        server.use(getMock.handler)
        server.use(archiveMock.handler)

        const waitForArchive = archiveMock.waitForRequest(server)

        renderComponent()

        await waitFor(() => {
            screen.getByText('Archive macro').click()
        })

        await waitForArchive(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ids: [mockMacroId],
            })
        })

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should unarchive macro', async () => {
        const unarchiveMock = mockBulkUnarchiveMacrosHandler()
        const getMock = mockGetMacroHandler(async ({ data }) =>
            HttpResponse.json({
                ...data,
                archived_datetime: '2025-04-09T4:14:27',
            }),
        )
        server.use(getMock.handler)
        server.use(unarchiveMock.handler)

        const waitForUnarchive = unarchiveMock.waitForRequest(server)

        renderComponent()

        await waitFor(() => {
            screen.getByText('Unarchive macro').click()
        })

        await waitForUnarchive(async (request) => {
            const requestBody = await request.json()
            expect(requestBody).toEqual({
                ids: [mockMacroId],
            })
        })

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/macros/archived',
            )
        })
    })
})
