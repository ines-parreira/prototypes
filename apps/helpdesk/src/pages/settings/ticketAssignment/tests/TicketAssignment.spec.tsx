import type { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { account } from 'fixtures/account'
import { teams } from 'fixtures/teams'
import { user } from 'fixtures/users'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import type MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import { fetchChats } from 'state/chats/actions'
import { submitSetting } from 'state/currentAccount/actions'
import type { AccountSettingTicketAssignment } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import type { RootState } from 'state/types'

import TicketAssignment from '../TicketAssignment'

jest.mock('state/chats/actions')
jest.mock('state/currentAccount/actions')
jest.mock(
    'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField',
    () =>
        ({
            selectedOptions,
            onChange,
        }: ComponentProps<typeof MultiSelectOptionsField>) => {
            return (
                <ul aria-label="MultiSelectOptionField mock">
                    {selectedOptions?.map((option) => {
                        return (
                            <li key={option.value} data-testid={option.value}>
                                {option.value}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(
                                            selectedOptions.filter(
                                                (o) => o.value !== option.value,
                                            ),
                                        )
                                    }
                                >
                                    Remove {option.value}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )
        },
)

const fetchChatsMock = (
    fetchChats as jest.MockedFunction<typeof fetchChats>
).mockReturnValue(() => Promise.resolve())

const submitSettingMock = (
    submitSetting as jest.MockedFunction<typeof submitSetting>
).mockReturnValue(() => Promise.resolve())

jest.mock('pages/common/components/UnsavedChangesPrompt', () =>
    jest.fn().mockReturnValue(null),
)
const UnsavedChangesPromptMock = UnsavedChangesPrompt as jest.Mock

const ticketAssignmentSetting: AccountSettingTicketAssignment = {
    id: 1,
    type: AccountSettingType.TicketAssignment,
    data: {
        auto_assign_to_teams: true,
        unassign_on_reply: true,
        unassign_on_user_unavailability: [],
        assignment_channels: [TicketChannel.Chat, TicketChannel.Email],
        max_user_chat_ticket: 3,
        max_user_non_chat_ticket: 4,
        can_exceed_max_agent_capacity: true,
        auto_assign_ticket_to_responding_agent: false,
    },
}

const defaultState = {
    currentAccount: fromJS({
        ...account,
        settings: [ticketAssignmentSetting],
    }) as Map<any, any>,
    currentUser: fromJS(user),
    teams: fromJS({ all: _keyBy(teams, 'id') }),
} as RootState

const mockStore = configureMockStore<RootState>([thunk])

describe('<TicketAssignment />', () => {
    it('should call `submitSetting` and call `fetchChats` on submit when the account has no `ticket-assignment` setting', async () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({}),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            data: {
                ...ticketAssignmentSetting.data,
                assignment_channels: [
                    TicketChannel.Chat,
                    TicketChannel.FacebookMessenger,
                ],
                auto_assign_to_teams: false,
            },
            id: undefined,
            type: AccountSettingType.TicketAssignment,
        })
        await waitFor(() => expect(fetchChatsMock).toHaveBeenCalled())
    })

    it('should call `submitSetting` and not call `fetchChats` on submit when nor the `auto_assign_to_teams` setting nor the `assignment_channels` setting has changed', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith(ticketAssignmentSetting)
        await waitFor(() => expect(fetchChatsMock).not.toHaveBeenCalled())
    })

    it('should call `fetchChats` on submit when the `auto_assign_to_teams` setting has changed', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Auto-assign tickets'))
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...ticketAssignmentSetting,
            data: {
                ...ticketAssignmentSetting.data,
                auto_assign_to_teams: false,
            },
        })
        await waitFor(() => expect(fetchChatsMock).toHaveBeenCalled())
    })

    it('should call `fetchChats` on submit when the `assignment_channels` setting has changed and `auto_assign_to_teams` is enabled', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText(`Remove ${TicketChannel.Chat}`))
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...ticketAssignmentSetting,
            data: {
                ...ticketAssignmentSetting.data,
                assignment_channels: [TicketChannel.Email],
            },
        })
        await waitFor(() => expect(fetchChatsMock).toHaveBeenCalled())
    })

    it('should not call `fetchChats` on submit when the `assignment_channels` setting has changed but `auto_assign_to_teams` is disabled', async () => {
        const setting = {
            ...ticketAssignmentSetting,
            data: {
                ...ticketAssignmentSetting.data,
                auto_assign_to_teams: false,
            },
        }

        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        settings: [setting],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText(`Remove ${TicketChannel.Chat}`))
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...setting,
            data: {
                ...setting.data,
                assignment_channels: [TicketChannel.Email],
            },
        })
        await waitFor(() => expect(fetchChatsMock).not.toHaveBeenCalled())
    })

    it('should send updated auto assignment limits on submit', async () => {
        const setting = {
            ...ticketAssignmentSetting,
            data: {
                ...ticketAssignmentSetting.data,
                max_user_chat_ticket: 20,
                max_user_non_chat_ticket: 50,
            },
        }
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        settings: [setting],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.change(screen.getByLabelText('Chat & Messaging tickets'), {
            target: { value: 0 },
        })
        fireEvent.change(screen.getByLabelText('Other text tickets'), {
            target: { value: 20 },
        })
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...setting,
            data: {
                ...setting.data,
                max_user_chat_ticket: 0,
                max_user_non_chat_ticket: 20,
            },
        })
    })

    it('should send updated unassign on user unavailability settings on submit', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(
            screen.getByText(
                'Unassign chat tickets when assigned agent is unavailable',
            ),
        )
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            id: 1,
            type: AccountSettingType.TicketAssignment,
            data: expect.objectContaining({
                unassign_on_user_unavailability: ['chat'],
            }),
        })
    })

    it('should send updated can_exceed_max_agent_capacity setting on submit', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText(/Allow reopened tickets/))
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            id: 1,
            type: AccountSettingType.TicketAssignment,
            data: expect.objectContaining({
                can_exceed_max_agent_capacity: false,
            }),
        })
    })

    it('should send updated auto_assign_ticket_to_responding_agent setting on submit', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(
            screen.getByText(/Assign ticket to last responding agent/),
        )
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            id: 1,
            type: AccountSettingType.TicketAssignment,
            data: expect.objectContaining({
                auto_assign_ticket_to_responding_agent: true,
            }),
        })
    })

    it('should send updated unassign_on_reply setting on submit', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Unassign on reply'))
        fireEvent.click(screen.getByText('Save changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            id: 1,
            type: AccountSettingType.TicketAssignment,
            data: expect.objectContaining({
                unassign_on_reply: false,
            }),
        })
    })

    it('should render the "unassign" checked, the "auto-assign" unchecked, and the "unassign on user unavailability" checkbox unchecked by default when no account setting for assignment', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({}),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        expect(
            screen.getByText('Auto-assign tickets').querySelector('input')
                ?.checked,
        ).toBe(false)
        expect(
            screen.getByText('Unassign on reply').querySelector('input')
                ?.checked,
        ).toBe(true)
        expect(
            screen
                .getByText(
                    'Unassign chat tickets when assigned agent is unavailable',
                )
                .querySelector('input')?.checked,
        ).toBe(false)
    })

    it('should render the store data', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        settings: [
                            {
                                ...ticketAssignmentSetting,
                                data: {
                                    ...ticketAssignmentSetting.data,
                                    max_user_chat_ticket: 20,
                                    max_user_non_chat_ticket: 50,
                                    auto_assign_to_teams: true,
                                    unassign_on_reply: false,
                                    unassign_on_user_unavailability: ['chat'],
                                },
                            },
                        ],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        expect(
            screen.getByText('Auto-assign tickets').querySelector('input')
                ?.checked,
        ).toBe(true)
        expect(
            screen.getByText('Unassign on reply').querySelector('input')
                ?.checked,
        ).toBe(false)
        expect(
            (screen.getByLabelText(/Chat & Messaging/) as HTMLInputElement)
                .value,
        ).toBe('20')
        expect(screen.getByTestId(TicketChannel.Chat)).toBeInTheDocument()
        expect(screen.getByTestId(TicketChannel.Email)).toBeInTheDocument()
        expect(
            (
                screen.getByLabelText(
                    /Unassign chat tickets when assigned agent is unavailable/,
                ) as HTMLInputElement
            ).checked,
        ).toBe(true)
    })

    it('should render the "Save changes" button loading and disabled when the setting are being saved', () => {
        submitSettingMock.mockReturnValueOnce(() => new Promise(_noop))
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Save changes'))

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render the create team cta when no team exists', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    teams: fromJS({ all: {} }),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        expect(
            screen.getByText(
                "You haven't set up any teams yet. Create your first team to configure auto assignment.",
            ),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Create team' }))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should render the unsaved changes prompt when the user tries to navigate away with unsaved changes', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Auto-assign tickets'))

        expect(UnsavedChangesPromptMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                when: true,
            }),
            {},
        )
    })

    it('should not render the unsaved changes prompt when the props have changed to reflect saved changes', () => {
        const { rerender } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Auto-assign tickets'))

        rerender(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        settings: [
                            {
                                ...ticketAssignmentSetting,
                                data: {
                                    ...ticketAssignmentSetting.data,
                                    auto_assign_to_teams: false,
                                },
                            },
                        ],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>,
        )

        expect(UnsavedChangesPromptMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                when: false,
            }),
            {},
        )
    })
})
