import React, { ComponentProps } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { Location } from 'history'
import { fromJS, Map } from 'immutable'
import { useLocation, useParams } from 'react-router-dom'

import { Macro } from '@gorgias/api-queries'

import { macros as macrosFixtures } from 'fixtures/macro'
import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {
    createMacro,
    deleteMacro,
    fetchMacro,
    updateMacro,
} from 'models/macro/resources'
import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import history from 'pages/history'
import MacroEdit from 'pages/tickets/common/macros/components/MacroEdit'
import { getDefaultMacro } from 'state/macro/utils'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'

import { MacrosSettingsFormContainer } from '../MacrosSettingsForm'

jest.mock('pages/history')
jest.mock('models/macro/resources')
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
                {actions?.map((action: Map<any, any>, i) => (
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

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const mockMutateBulkArchive = jest.fn()
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateBulkUnarchive = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Link: () => <div>Link Mock</div>,
    useLocation: jest.fn(),
    useParams: jest.fn(),
}))
const mockedUseLocation = assumeMock(useLocation)
const mockedUseParams = assumeMock(useParams)

describe('<MacrosSettingsForm/>', () => {
    useHasAgentPrivilegesMock.mockReturnValue(true)

    const newMacroFixture = {
        actions: [],
        id: 5,
        name: 'New macro',
        category: '',
        created_datetime: '',
        external_id: '',
        updated_datetime: '',
        uri: '',
        usage: 0,
        language: null,
    }
    const duplicatedMacroFixture = {
        ...macrosFixtures[0],
        name: `(Copy) ${macrosFixtures[0].name}`,
        id: 5,
    }
    const mockCreateMacro: jest.MockedFunction<typeof createMacro> =
        createMacro as any
    const mockDeleteMacro: jest.MockedFunction<typeof deleteMacro> =
        deleteMacro as any
    const mockFetchMacro: jest.MockedFunction<typeof fetchMacro> =
        fetchMacro as any
    const mockUpdateMacro: jest.MockedFunction<typeof updateMacro> =
        updateMacro as any
    const mockMacroCreated = jest.fn()
    const mockMacroDeleted = jest.fn()
    const mockMacroFetched = jest.fn()
    const mockMacroUpdated = jest.fn()
    const mockNotify = jest.fn()
    const minProps = {
        agents: fromJS({}),
        macros: {},
        macroCreated: mockMacroCreated,
        macroDeleted: mockMacroDeleted,
        macroFetched: mockMacroFetched,
        macroUpdated: mockMacroUpdated,
        notify: mockNotify,
    } as any as ComponentProps<typeof MacrosSettingsFormContainer>

    mockCreateMacro.mockResolvedValue(newMacroFixture)
    mockDeleteMacro.mockResolvedValue()
    mockFetchMacro.mockResolvedValue(macrosFixtures[0])
    mockUpdateMacro.mockResolvedValue(macrosFixtures[0])
    useBulkArchiveMacrosMock.mockReturnValue({
        mutate: mockMutateBulkArchive,
    } as unknown as ReturnType<typeof useBulkArchiveMacros>)
    useBulkUnarchiveMacrosMock.mockReturnValue({
        mutate: mockMutateBulkUnarchive,
    } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)

    beforeEach(() => {
        mockedUseParams.mockReturnValue({ macroId: '1' })
        mockedUseLocation.mockReturnValue({
            state: {},
        } as Location<unknown>)
    })

    it('should render an empty form when no macro id', () => {
        mockedUseParams.mockReturnValue({})
        render(<MacrosSettingsFormContainer {...minProps} />)

        expect(screen.getByText('Add macro')).toBeInTheDocument()
        expect(screen.getByText('Create macro')).toBeInTheDocument()
        expect(screen.queryByText('Archive macro')).not.toBeInTheDocument()
    })

    it('should display a loader when fetching a macro', () => {
        render(<MacrosSettingsFormContainer {...minProps} />)

        expect(screen.getByText('LoaderMock')).toBeInTheDocument()
    })

    it('should render a filled form when passed macro id', async () => {
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{ '1': macrosFixtures[0] }}
            />,
        )

        await waitFor(() =>
            expect(screen.queryByText('LoaderMock')).not.toBeInTheDocument(),
        )
        expect(screen.getByText('Update macro')).toBeInTheDocument()
        expect(screen.getByText('Duplicate macro')).toBeInTheDocument()
        expect(screen.getByText('Delete macro')).toBeInTheDocument()
        expect(screen.queryByText('Archive macro')).toBeInTheDocument()
    })

    it('should notify the user when failed to fetch the macro', async () => {
        mockFetchMacro.mockRejectedValue('error')
        render(<MacrosSettingsFormContainer {...minProps} />)

        await waitFor(() => {
            expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macro',
                status: NotificationStatus.Error,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should create macro and redirect to /app/settings/macros', async () => {
        mockedUseParams.mockReturnValue({})
        render(<MacrosSettingsFormContainer {...minProps} />)

        screen.getByText('Create macro').click()
        await waitFor(() => {
            expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
                ...getDefaultMacro(),
                language: null,
            })
            expect(mockMacroCreated).toHaveBeenNthCalledWith(1, newMacroFixture)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro.',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should update macro and redirect to app/settings/macros', async () => {
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Update macro').click()

            expect(mockUpdateMacro).toHaveBeenNthCalledWith(
                1,
                macrosFixtures[0],
            )
            expect(mockMacroUpdated).toHaveBeenNthCalledWith(
                1,
                macrosFixtures[0],
            )
            expect(mockNotify).toHaveBeenNthCalledWith(2, {
                message: 'Successfully updated macro.',
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
        const customFieldsMacro: Macro = {
            id: 3,
            name: 'Set some custom fields',
            actions: macroActions,
            created_datetime: '2017-08-01T17:56:51.220733+00:00',
            updated_datetime: '2017-08-01T17:56:51.220744+00:00',
            usage: 0,
            language: null,
            uri: '',
            external_id: null,
        }
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': customFieldsMacro,
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Update macro').click()

            expect(mockUpdateMacro).toHaveBeenNthCalledWith(1, {
                ...customFieldsMacro,
                actions: macroActions.slice(0, 2),
            })
        })
    })

    it('should notify when failing to create macro', async () => {
        const message = 'Error message'
        const error1Reason = 'Reason 1.'
        const error2Reason = 'Reason 2.'
        mockCreateMacro.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: message,
                        data: {
                            actions: {
                                3: {
                                    arguments: [{ tags: [error1Reason] }],
                                },
                                5: {
                                    other: [{ url: [error2Reason] }],
                                },
                            },
                        },
                    },
                },
            },
        })
        mockedUseParams.mockReturnValue({})
        render(<MacrosSettingsFormContainer {...minProps} />)

        await waitFor(() => {
            screen.getByText('Create macro').click()
        })
        expect(mockNotify).toHaveBeenCalledWith({
            message: `${message} ${error1Reason}, ${error2Reason}`,
            status: NotificationStatus.Error,
        })
    })

    it('should notify when failing to update macro', async () => {
        const message = 'Error message'
        mockUpdateMacro.mockRejectedValue({
            response: { data: { error: { msg: message } } },
        })
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Update macro').click()
        })

        expect(mockNotify).toHaveBeenCalledWith({
            message: `${message} `,
            status: NotificationStatus.Error,
        })
    })

    it('should disable submit button when submitting form', () => {
        mockedUseParams.mockReturnValue({})
        render(<MacrosSettingsFormContainer {...minProps} />)

        screen.getByText('Create macro').click()
        screen.getByText('Create macro').click()

        expect(mockCreateMacro).toHaveBeenCalledTimes(1)
    })

    it('should delete macro and redirect to /app/settings/macros', async () => {
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Delete macro').click()
        })
        expect(mockDeleteMacro).toHaveBeenNthCalledWith(1, 1)

        expect(mockMacroDeleted).toHaveBeenNthCalledWith(1, 1)
        expect(mockNotify).toHaveBeenNthCalledWith(2, {
            message: 'Successfully deleted macro',
            status: NotificationStatus.Success,
        })
        expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
    })

    it('should notify when failing to delete macro', async () => {
        const mockMessage =
            'Cannot delete macro because it is used in the following places:'
        mockDeleteMacro.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: mockMessage,
                        data: {
                            Rules: ['Rule1', 'Rule2'],
                        },
                    },
                },
            },
        })
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Delete macro').click()
        })
        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                title: mockMessage,
                status: NotificationStatus.Error,
            }),
        )
    })

    it('should duplicate macro and redirect ', async () => {
        mockCreateMacro.mockResolvedValue(duplicatedMacroFixture)
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )
        await waitFor(() => {
            screen.getByText('Duplicate macro').click()
            const { actions, name } = macrosFixtures[0]
            expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
                actions,
                name: `(Copy) ${name}`,
                language: null,
            })

            expect(mockMacroCreated).toHaveBeenNthCalledWith(
                1,
                duplicatedMacroFixture,
            )
            expect(mockNotify).toHaveBeenNthCalledWith(2, {
                message: 'Successfully duplicated macro.',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros/5')
        })
    })

    it('should notify when failing to duplicate macro', async () => {
        mockCreateMacro.mockRejectedValue('error')
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Duplicate macro').click()
            expect(mockNotify).toHaveBeenNthCalledWith(2, {
                message: 'Failed to duplicate macro.',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should update actions of macro form', async () => {
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('MacroEditMock').click()
        })
        expect(screen.getAllByText(MacroActionName.Http)).toHaveLength(2)
        expect(
            screen.getByText(MacroActionName.AddAttachments),
        ).toBeInTheDocument()
    })

    it('should archive macro', async () => {
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Archive macro').click()
            expect(mockMutateBulkArchive).toHaveBeenCalledWith({
                data: { ids: [1] },
            })
            expect(history.push).toHaveBeenCalledWith('/app/settings/macros')
        })
    })

    it('should unarchive macro', async () => {
        mockedUseLocation.mockReturnValue({
            state: {
                isArchived: true,
            },
        } as Location<unknown>)
        render(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />,
        )

        await waitFor(() => {
            screen.getByText('Unarchive macro').click()
            expect(mockMutateBulkUnarchive).toHaveBeenCalledWith({
                data: { ids: [1] },
            })
            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/macros/archived',
            )
        })
    })
})
