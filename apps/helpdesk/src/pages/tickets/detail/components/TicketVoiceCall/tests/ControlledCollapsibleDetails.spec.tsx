import type React from 'react'

import { fireEvent, render } from '@testing-library/react'

import ControlledCollapsibleDetails from '../ControlledCollapsibleDetails'

describe('ControlledCollapsibleDetails', () => {
    const renderComponent = (
        title: JSX.Element,
        children: React.ReactNode,
        isOpen: boolean,
        setIsOpen: (isOpen: boolean) => void,
    ) => {
        return render(
            <ControlledCollapsibleDetails
                title={title}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            >
                {children}
            </ControlledCollapsibleDetails>,
        )
    }
    it('should only render title in closed state', () => {
        const title = <h1>Test Title</h1>
        const children = <p>Test Children</p>
        const setIsOpen = jest.fn()
        const { getByText, queryByText } = renderComponent(
            title,
            children,
            false,
            setIsOpen,
        )
        expect(getByText('Test Title')).toBeInTheDocument()
        expect(getByText('keyboard_arrow_down')).toBeInTheDocument()
        expect(queryByText('Test Children')).not.toBeInTheDocument()

        fireEvent.click(getByText('Test Title'))
        expect(setIsOpen).toHaveBeenCalledWith(true)
    })

    it('should render content in open state', () => {
        const title = <h1>Test Title</h1>
        const children = <p>Test Children</p>
        const setIsOpen = jest.fn()
        const { getByText } = renderComponent(title, children, true, setIsOpen)

        expect(getByText('Test Title')).toBeInTheDocument()
        expect(getByText('keyboard_arrow_up')).toBeInTheDocument()
        expect(getByText('Test Children')).toBeInTheDocument()

        fireEvent.click(getByText('Test Title'))
        expect(setIsOpen).toHaveBeenCalledWith(false)
    })
})
