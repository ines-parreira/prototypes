import { fireEvent, render, screen } from '@testing-library/react'

import {
    UnsavedChangesModalProvider,
    useUnsavedChangesModal,
} from '../UnsavedChangesModalProvider'

function TestComponent() {
    const {
        isOpen,
        openUnsavedChangesModal,
        closeUnsavedChangesModal,
        setHasUnsavedChangesRef,
        getHasUnsavedChanges,
    } = useUnsavedChangesModal()

    return (
        <div>
            <div>Modal is {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={openUnsavedChangesModal}>Open Modal</button>
            <button onClick={closeUnsavedChangesModal}>Close Modal</button>
            <button onClick={() => setHasUnsavedChangesRef(true)}>
                Set Dirty
            </button>
            <button onClick={() => setHasUnsavedChangesRef(false)}>
                Set Clean
            </button>
            <button onClick={() => setHasUnsavedChangesRef(null)}>
                Set Null
            </button>
            <div data-testid="dirty-value">
                {String(getHasUnsavedChanges())}
            </div>
        </div>
    )
}

describe('UnsavedChangesModalContext', () => {
    it('should throw error when used outside provider', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => render(<TestComponent />)).toThrow(
            'useUnsavedChangesModal must be used within a UnsavedChangesModalProvider',
        )
    })

    it('should provide default context values', () => {
        render(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )

        expect(screen.getByText(/Modal is Closed/i)).toBeInTheDocument()
        expect(screen.getByTestId('dirty-value').textContent).toBe('null')
    })

    it('should open and close modal correctly', () => {
        render(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )

        const openButton = screen.getByText('Open Modal')
        const closeButton = screen.getByText('Close Modal')

        // Initially closed
        expect(screen.getByText(/Modal is Closed/i)).toBeInTheDocument()

        fireEvent.click(openButton)
        expect(screen.getByText(/Modal is Open/i)).toBeInTheDocument()

        fireEvent.click(closeButton)
        expect(screen.getByText(/Modal is Closed/i)).toBeInTheDocument()
    })

    it('should set and get hasUnsavedChanges correctly', () => {
        const { rerender } = render(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )

        const setDirtyBtn = screen.getByText('Set Dirty')
        const setCleanBtn = screen.getByText('Set Clean')
        const setNullBtn = screen.getByText('Set Null')
        const dirtyValue = screen.getByTestId('dirty-value')

        expect(dirtyValue.textContent).toBe('null')

        fireEvent.click(setDirtyBtn)

        rerender(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )
        expect(dirtyValue.textContent).toBe('true')

        fireEvent.click(setCleanBtn)
        rerender(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )
        expect(dirtyValue.textContent).toBe('false')

        fireEvent.click(setNullBtn)
        rerender(
            <UnsavedChangesModalProvider>
                <TestComponent />
            </UnsavedChangesModalProvider>,
        )
        expect(dirtyValue.textContent).toBe('null')
    })
})
