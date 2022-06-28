import {fromJS, Map} from 'immutable'
import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState} from 'state/types'
import {account} from 'fixtures/account'
import {teams} from 'fixtures/teams'
import {
    AccountSettingTicketAssignment,
    AccountSettingType,
} from 'state/currentAccount/types'
import {TicketChannel} from 'business/types/ticket'
import {submitSetting} from 'state/currentAccount/actions'
import {fetchChats} from 'state/chats/actions'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'

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
                    {selectedOptions.map((option) => {
                        return (
                            <li key={option.value}>
                                {option.value}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange(
                                            selectedOptions.filter(
                                                (o) => o.value !== option.value
                                            )
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
        }
)

const fetchChatsMock = (
    fetchChats as jest.MockedFunction<typeof fetchChats>
).mockReturnValue(() => Promise.resolve())

const submitSettingMock = (
    submitSetting as jest.MockedFunction<typeof submitSetting>
).mockReturnValue(() => Promise.resolve())

const ticketAssignmentSetting: AccountSettingTicketAssignment = {
    id: 1,
    type: AccountSettingType.TicketAssignment,
    data: {
        auto_assign_to_teams: true,
        unassign_on_reply: true,
        assignment_channels: [
            TicketChannel.Chat,
            TicketChannel.FacebookMessenger,
        ],
        max_user_chat_ticket: 3,
        max_user_non_chat_ticket: 4,
    },
}

const defaultState = {
    currentAccount: fromJS({
        ...account,
        settings: [ticketAssignmentSetting],
    }) as Map<any, any>,
    teams: fromJS({all: _keyBy(teams, 'id')}),
} as RootState

const mockStore = configureMockStore<RootState>([thunk])

describe('<TicketAssignment/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call `submitSetting` and call `fetchChats` on submit when the account has no `ticket-assignment` setting', async () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({}),
                })}
            >
                <TicketAssignment />
            </Provider>
        )

        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
        expect(fetchChatsMock).toBeCalledWith()
    })

    it('should call `submitSetting` and not call `fetchChats` on submit when nor the `auto_assign_to_teams` setting nor the `assignment_channels` setting has changed', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>
        )

        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
        expect(fetchChatsMock).not.toBeCalledWith()
    })

    it('should call `fetchChats` on submit when the `auto_assign_to_teams` setting has changed', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>
        )

        fireEvent.click(getByText('Auto-assign tickets'))
        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
        expect(fetchChatsMock).toBeCalledWith()
    })

    it('should call `fetchChats` on submit when the `assignment_channels` setting has changed and `auto_assign_to_teams` is enabled', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>
        )

        fireEvent.click(getByText(`Remove ${TicketChannel.Chat}`))
        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
        expect(fetchChatsMock).toBeCalledWith()
    })

    it('should not call `fetchChats` on submit when the `assignment_channels` setting has changed but `auto_assign_to_teams` is disabled', async () => {
        const {getByText} = render(
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
            </Provider>
        )

        fireEvent.click(getByText(`Remove ${TicketChannel.Chat}`))
        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
        expect(fetchChatsMock).not.toBeCalledWith()
    })

    it('should send updated auto assignment limits on submit', async () => {
        const {getByText, getByLabelText} = render(
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
                                },
                            },
                        ],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>
        )

        fireEvent.change(getByLabelText('Chat & Messaging tickets'), {
            target: {value: 0},
        })
        fireEvent.change(getByLabelText('Other text tickets'), {
            target: {value: 20},
        })
        fireEvent.click(getByText('Save changes'))
        await waitFor(() => expect(submitSettingMock).toHaveBeenCalled())

        expect(submitSettingMock.mock.calls).toMatchSnapshot()
    })

    it('should render the "unassign" checkbox checked by default and the "auto-assign" checkbox unchecked by default when no account setting for assignment', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({}),
                })}
            >
                <TicketAssignment />
            </Provider>
        )

        expect(
            getByText('Auto-assign tickets').querySelector('input')?.checked
        ).toBe(false)
        expect(
            getByText('Unassign on reply').querySelector('input')?.checked
        ).toBe(true)
    })

    it('should render the store data', () => {
        const {container, getByText} = render(
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
                                },
                            },
                        ],
                    }),
                })}
            >
                <TicketAssignment />
            </Provider>
        )

        expect(
            getByText('Auto-assign tickets').querySelector('input')?.checked
        ).toBe(true)
        expect(
            getByText('Unassign on reply').querySelector('input')?.checked
        ).toBe(false)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the "Save changes" button loading and disabled when the setting are being saved', () => {
        submitSettingMock.mockReturnValueOnce(() => new Promise(_noop))
        const {container, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketAssignment />
            </Provider>
        )

        fireEvent.click(getByText('Save changes'))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the create team cta when no team exists', () => {
        const {container} = render(
            <Provider
                store={mockStore({...defaultState, teams: fromJS({all: {}})})}
            >
                <TicketAssignment />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
