import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {createTeam} from 'state/teams/actions'
import {RootState, StoreDispatch} from 'state/types'
import TeamCreationModal from '../TeamCreationModal'

const minProps = {
    isOpen: false,
    onClose: jest.fn(),
} as unknown as ComponentProps<typeof TeamCreationModal>

jest.mock('state/teams/actions', () => ({
    createTeam: jest.fn(() => () => Promise.resolve({})),
}))

describe('<TeamCreationModal />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render anything when the modal is closed', () => {
        const store = mockStore({})
        const {baseElement} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} />
            </Provider>
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render the opened modal', () => {
        const store = mockStore({})
        const {baseElement} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should disable submit button when filling conditions are not met', () => {
        const store = mockStore({})
        const {getAllByText} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>
        )

        expect(
            getAllByText(/create team/i)[1].classList.contains('isDisabled')
        ).toBe(true)
    })

    it('should submit form when filling conditions are met', () => {
        const store = mockStore({})
        const teamName = 'Artemis'
        const teamDescription = 'Goddess of the hunt'

        const {getByLabelText, getAllByText} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: {value: teamName},
        })
        fireEvent.change(getByLabelText(/description/i), {
            target: {value: teamDescription},
        })
        fireEvent.click(getAllByText(/Create team/i)[1])

        expect(createTeam).toHaveBeenCalledWith(
            fromJS({
                name: teamName,
                description: teamDescription,
                decoration: {},
                members: [],
            })
        )
    })

    it('should close modal and reset values once form has successfully been submitted', async () => {
        const store = mockStore({})
        const {getByLabelText, getAllByText} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: {value: 'Artemis'},
        })
        fireEvent.change(getByLabelText(/description/i), {
            target: {value: 'Goddess of the hunt'},
        })
        fireEvent.click(getAllByText(/create team/i)[1])

        await waitFor(() => {
            expect(minProps.onClose).toHaveBeenCalled()
            expect(getByLabelText(/team name/i).getAttribute('value')).toBe('')
            expect(getByLabelText(/description/i).getAttribute('value')).toBe(
                ''
            )
        })
    })

    it('should keep modal open and retain the form values when submit attempt failed', async () => {
        ;(createTeam as jest.Mock).mockReturnValueOnce({error: 'error'})

        const store = mockStore({})
        const teamName = 'Artemis'
        const {getByLabelText, getAllByText} = render(
            <Provider store={store}>
                <TeamCreationModal {...minProps} isOpen />
            </Provider>
        )

        fireEvent.change(getByLabelText(/team name/i), {
            target: {value: teamName},
        })
        fireEvent.click(getAllByText(/create team/i)[1])

        await waitFor(() => {
            expect(minProps.onClose).not.toHaveBeenCalled()
        })
    })
})
