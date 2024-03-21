import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps, createRef} from 'react'
import {fromJS} from 'immutable'
import {mockStore} from 'utils/testing'
import CallTransferDropdown from '../CallTransferDropdown'

describe('CallTransferDropdown', () => {
    const setIsOpen = jest.fn()
    const onTransferInitiated = jest.fn()

    const baseProps = {
        isOpen: true,
        setIsOpen,
        onTransferInitiated,
        target: createRef<HTMLElement>(),
    }

    const renderComponent = (
        props: ComponentProps<typeof CallTransferDropdown> = baseProps
    ) =>
        render(
            <Provider
                store={mockStore({
                    agents: fromJS({
                        all: [
                            {id: 1, name: 'Agent 1'},
                            {id: 2, name: 'Agent 2'},
                            {id: 3, name: 'Agent 3'},
                            {id: 4, name: 'Agent 4'},
                        ],
                    }),
                    currentUser: fromJS({
                        id: 2,
                    }),
                } as any)}
            >
                <CallTransferDropdown {...props} />
            </Provider>
        )

    afterEach(cleanup)

    it(`renders the dropdown body when isOpen is true and doesn't display current agent`, () => {
        renderComponent()
        expect(screen.getByText('Agents')).toBeInTheDocument()
        expect(screen.getByText('Agent 1')).toBeInTheDocument()
        expect(screen.queryByText('Agent 2')).not.toBeInTheDocument()
        expect(screen.getByText('Agent 4')).toBeInTheDocument()
    })

    it('does not render the dropdown body when isOpen is false', () => {
        renderComponent({...baseProps, isOpen: false})
        expect(screen.queryByText('Agents')).not.toBeInTheDocument()
    })

    it('calls the setIsOpen function when the target element is clicked', () => {
        renderComponent()
        fireEvent.click(screen.getByTestId('floating-overlay'))
        expect(setIsOpen).toHaveBeenCalled()
    })

    it(`doesn't select more than one agent`, () => {
        renderComponent()
        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        expect(within(agent1).getByText(/done/i)).toBeVisible()

        const agent3 = screen.getByRole('option', {
            name: /agent 3/i,
        })
        fireEvent.click(agent3)
        expect(within(agent3).getByText(/done/i)).toBeVisible()
        expect(within(agent1).queryByText(/done/i)).toBeNull()
    })

    it('only enables the transfer button when an agent is selected', () => {
        renderComponent()

        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).toHaveAttribute('aria-disabled', 'true')

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        expect(
            screen.getByRole('button', {name: /transfer call/i})
        ).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('calls the onTransferInitiated function when the transfer button is clicked', () => {
        renderComponent()
        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        fireEvent.click(agent1)
        fireEvent.click(screen.getByRole('button', {name: /transfer call/i}))
        expect(onTransferInitiated).toHaveBeenCalled()
        expect(setIsOpen).toHaveBeenLastCalledWith(false)
    })
})
