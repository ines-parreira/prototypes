import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'
import { RootState, StoreDispatch } from 'state/types'

import { DeactivatedAccountGuard } from './DeactivatedAccountGuard'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

// Mock the hook
jest.mock('hooks/useIsAccountDeactivated', () => ({
    useIsAccountDeactivated: jest.fn(),
}))

const mockUseIsAccountDeactivated = useIsAccountDeactivated as jest.Mock

const TestChild = () => (
    <div data-testid="protected-content">Protected Content</div>
)

const renderDeactivatedAccountGuard = (
    children: React.ReactNode = <TestChild />,
) => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore({})}>
                <DeactivatedAccountGuard>{children}</DeactivatedAccountGuard>
            </Provider>
        </MemoryRouter>,
    )
}

describe('DeactivatedAccountGuard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when account is not deactivated', () => {
        beforeEach(() => {
            mockUseIsAccountDeactivated.mockReturnValue(false)
        })

        it('should render children when account is active', () => {
            renderDeactivatedAccountGuard()

            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
            expect(screen.getByText('Protected Content')).toBeInTheDocument()
        })

        it('should render multiple children when account is active', () => {
            const MultipleChildren = () => (
                <>
                    <div data-testid="child-1">Child 1</div>
                    <div data-testid="child-2">Child 2</div>
                </>
            )

            renderDeactivatedAccountGuard(<MultipleChildren />)

            expect(screen.getByTestId('child-1')).toBeInTheDocument()
            expect(screen.getByTestId('child-2')).toBeInTheDocument()
        })
    })

    describe('when account is deactivated', () => {
        beforeEach(() => {
            mockUseIsAccountDeactivated.mockReturnValue(true)
        })

        it('should redirect to /app/views when account is deactivated', () => {
            renderDeactivatedAccountGuard()

            // Check that the redirect component is rendered
            expect(
                screen.queryByTestId('protected-content'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Protected Content'),
            ).not.toBeInTheDocument()
        })

        it('should not render children when account is deactivated', () => {
            const CustomChild = () => (
                <div data-testid="custom-child">Custom Child</div>
            )

            renderDeactivatedAccountGuard(<CustomChild />)

            expect(screen.queryByTestId('custom-child')).not.toBeInTheDocument()
            expect(screen.queryByText('Custom Child')).not.toBeInTheDocument()
        })
    })

    describe('hook integration', () => {
        it('should call useIsAccountDeactivated hook', () => {
            mockUseIsAccountDeactivated.mockReturnValue(false)

            renderDeactivatedAccountGuard()

            expect(mockUseIsAccountDeactivated).toHaveBeenCalledTimes(1)
        })

        it('should handle hook returning true', () => {
            mockUseIsAccountDeactivated.mockReturnValue(true)

            renderDeactivatedAccountGuard()

            expect(mockUseIsAccountDeactivated).toHaveBeenCalledTimes(1)
            expect(
                screen.queryByTestId('protected-content'),
            ).not.toBeInTheDocument()
        })

        it('should handle hook returning false', () => {
            mockUseIsAccountDeactivated.mockReturnValue(false)

            renderDeactivatedAccountGuard()

            expect(mockUseIsAccountDeactivated).toHaveBeenCalledTimes(1)
            expect(screen.getByTestId('protected-content')).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle empty children', () => {
            mockUseIsAccountDeactivated.mockReturnValue(false)

            renderDeactivatedAccountGuard(null)

            // Should not crash and should not render anything
            expect(
                screen.queryByTestId('protected-content'),
            ).not.toBeInTheDocument()
        })

        it('should handle undefined children', () => {
            mockUseIsAccountDeactivated.mockReturnValue(false)

            const { container } = render(
                <MemoryRouter>
                    <Provider store={mockStore({})}>
                        <DeactivatedAccountGuard>
                            {undefined}
                        </DeactivatedAccountGuard>
                    </Provider>
                </MemoryRouter>,
            )

            // Should not crash and should not render anything
            expect(container.firstChild).toBeNull()
        })

        it('should handle hook throwing an error gracefully', () => {
            mockUseIsAccountDeactivated.mockImplementation(() => {
                throw new Error('Hook error')
            })

            // Should not crash the component
            expect(() => renderDeactivatedAccountGuard()).toThrow('Hook error')
        })
    })
})
