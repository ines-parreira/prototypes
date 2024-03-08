import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps, createRef} from 'react'
import {fromJS} from 'immutable'
import {mockStore} from 'utils/testing'
import CallTransferDropdown from '../CallTransferDropdown'

describe('CallTransferDropdown', () => {
    const onToggle = jest.fn()

    const baseProps = {
        isOpen: true,
        onToggle,
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
                } as any)}
            >
                <CallTransferDropdown {...props} />
            </Provider>
        )

    afterEach(cleanup)

    it('renders the dropdown body when isOpen is true', () => {
        renderComponent()
        expect(screen.getByText('Agents')).toBeInTheDocument()
        expect(screen.getByText('Agent 1')).toBeInTheDocument()
        expect(screen.getByText('Agent 4')).toBeInTheDocument()
    })

    it('does not render the dropdown body when isOpen is false', () => {
        renderComponent({...baseProps, isOpen: false})
        expect(screen.queryByText('Agents')).not.toBeInTheDocument()
    })

    it('calls the onToggle function when the target element is clicked', () => {
        renderComponent()
        fireEvent.click(screen.getByTestId('floating-overlay'))
        expect(onToggle).toHaveBeenCalled()
    })
})
