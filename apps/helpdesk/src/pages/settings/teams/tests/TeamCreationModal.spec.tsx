import type { ComponentProps } from 'react'
import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { createTeam } from 'models/team/resources'
import type { RootState, StoreDispatch } from 'state/types'

import TeamCreationModal from '../TeamCreationModal'

const minProps = {
    isOpen: false,
    onClose: jest.fn(),
    onTeamCreated: jest.fn(),
} as unknown as ComponentProps<typeof TeamCreationModal>

jest.mock('models/team/resources', () => ({
    createTeam: jest.fn(() => () => Promise.resolve({})),
}))

jest.mock('pages/settings/teams/RuleCreationModalContent.tsx', () => () => (
    <div>RuleCreationModalContent</div>
))

jest.mock('pages/common/components/EmojiPicker/EmojiPicker', () => ({
    __esModule: true,
    default: ({ onClick }: any) => (
        <button
            type="button"
            onClick={(event) => {
                onClick({ native: '😀' }, event)
            }}
        >
            Select emoji
        </button>
    ),
}))

jest.mock('@repo/logging')

const logEventMock = logEvent as jest.Mock

describe('<TeamCreationModal />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    it('should not render anything when the modal is closed', () => {
        const store = mockStore({})
        const { baseElement } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} />
            </Provider>,
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render the opened modal', () => {
        const store = mockStore({})
        const { baseElement } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should disable submit button when filling conditions are not met', () => {
        const store = mockStore({})
        const { getByRole } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        expect(
            getByRole('button', {
                name: /create team/i,
            }),
        ).toBeAriaDisabled()
    })

    it('should submit, send a segment event and call onTeamCreated form when filling conditions are met', async () => {
        const teamName = 'Artemis'
        const teamDescription = 'Goddess of the hunt'
        const nextTeam = {
            name: teamName,
            description: teamDescription,
            decoration: {},
            members: [{ id: 1 }],
        }
        ;(createTeam as jest.Mock).mockImplementation(() => () => nextTeam)
        const store = mockStore({
            agents: fromJS({
                all: [{ id: 1, name: 'foo bar' }],
            }),
        })
        const { getByLabelText, getAllByText, getByText } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: { value: teamName },
        })
        fireEvent.change(getByLabelText(/description/i), {
            target: { value: teamDescription },
        })
        fireEvent.focus(getByText(/Add at least 1 team member/i))
        fireEvent.click(screen.getByText(/foo bar/i))
        fireEvent.click(getAllByText(/Create team/i)[1])

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TeamWizardCreatedTeam,
        )
        expect(createTeam).toHaveBeenCalledWith(nextTeam)
        await waitFor(() => {
            expect(minProps.onTeamCreated).toHaveBeenNthCalledWith(1)
        })
    })

    it('should submit selected emoji in team decoration', async () => {
        const store = mockStore({
            agents: fromJS({
                all: [{ id: 1, name: 'foo bar' }],
            }),
        })

        const { getByLabelText, getAllByText, getByText, getByRole } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: { value: 'Apollo' },
        })
        fireEvent.change(getByLabelText(/description/i), {
            target: { value: 'God of music' },
        })
        fireEvent.click(getByText('insert_emoticon'))
        fireEvent.click(getByRole('button', { name: 'Select emoji' }))

        fireEvent.focus(getByText(/Add at least 1 team member/i))
        fireEvent.click(screen.getByText(/foo bar/i))
        fireEvent.click(getAllByText(/Create team/i)[1])

        await waitFor(() => {
            expect(createTeam).toHaveBeenCalledWith(
                expect.objectContaining({
                    decoration: {
                        emoji: expect.objectContaining({
                            native: '😀',
                        }),
                    },
                }),
            )
        })
    })

    it('should display the rule creation form once team creation form has successfully been submitted', async () => {
        const store = mockStore({
            agents: fromJS({
                all: [{ id: 1, name: 'foo bar' }],
            }),
        })
        const { getByLabelText, getAllByText, getByText } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: { value: 'Artemis' },
        })
        fireEvent.change(getByLabelText(/description/i), {
            target: { value: 'Goddess of the hunt' },
        })
        fireEvent.focus(getByText(/Add at least 1 team member/i))
        fireEvent.click(screen.getByText(/foo bar/i))
        fireEvent.click(getAllByText(/create team/i)[1])

        await waitFor(() => {
            expect(getByText(/RuleCreationModalContent/i)).toBeTruthy()
        })
    })

    it('should reset values if modal is closed', async () => {
        const store = mockStore({
            agents: fromJS({
                all: [{ id: 1, name: 'foo bar' }],
            }),
        })
        const { getByLabelText, rerender } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: { value: 'Artemis' },
        })
        rerender(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen={false} />
            </Provider>,
        )
        rerender(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        await waitFor(() => {
            expect(getByLabelText(/team name/i).getAttribute('value')).toBe('')
        })
    })

    it('should keep modal open and retain the form values when submit attempt failed', async () => {
        ;(createTeam as jest.Mock).mockReturnValueOnce({ error: 'error' })

        const store = mockStore({})
        const teamName = 'Artemis'
        const { getByLabelText, getAllByText } = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>,
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: { value: teamName },
        })
        fireEvent.click(getAllByText(/create team/i)[1])

        await waitFor(() => {
            expect(minProps.onClose).not.toHaveBeenCalled()
        })
    })
})
