import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TrainButton } from '../TrainButton'

jest.mock('pages/common/components/dropdown/UncontrolledDropdown', () => ({
    __esModule: true,
    default: ({ children }: any) => (
        <div data-testid="dropdown">{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownBody', () => ({
    __esModule: true,
    default: ({ children }: any) => (
        <div data-testid="dropdown-body">{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownItem', () => ({
    __esModule: true,
    default: ({ option, onClick }: any) => (
        <button data-testid={`dropdown-item-${option.value}`} onClick={onClick}>
            {option.label}
        </button>
    ),
}))

jest.mock('pages/common/components/button/DropdownButton', () => ({
    __esModule: true,
    default: React.forwardRef(
        ({ children, isDisabled, onToggleClick }: any, ref: any) => (
            <button
                data-testid="dropdown-button"
                disabled={isDisabled}
                onClick={onToggleClick}
                ref={ref}
            >
                {children}
            </button>
        ),
    ),
}))

describe('TrainButton', () => {
    const defaultProps = {
        isLoadingGuidanceArticles: false,
        guidanceArticlesLength: 0,
        setIsGuidanceTemplatesModalOpen: jest.fn(),
        onCustomGuidanceClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders "Create Guidance" when there are no guidance articles', () => {
        render(<TrainButton {...defaultProps} />)

        expect(screen.getByTestId('dropdown-button')).toHaveTextContent(
            'Create Guidance',
        )
    })

    it('renders "Add Guidance" when there are existing guidance articles', () => {
        render(<TrainButton {...defaultProps} guidanceArticlesLength={3} />)

        expect(screen.getByTestId('dropdown-button')).toHaveTextContent(
            'Add Guidance',
        )
    })

    it('disables the button when loading guidance articles', () => {
        render(
            <TrainButton {...defaultProps} isLoadingGuidanceArticles={true} />,
        )

        expect(screen.getByTestId('dropdown-button')).toBeDisabled()
    })

    it('renders dropdown with "Start from template" and "Custom" options', () => {
        render(<TrainButton {...defaultProps} />)

        expect(screen.getByTestId('dropdown')).toBeInTheDocument()
        expect(screen.getByTestId('dropdown-body')).toBeInTheDocument()
        expect(
            screen.getByTestId('dropdown-item-start_from_template'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('dropdown-item-custom')).toBeInTheDocument()

        expect(screen.getByText('Start from template')).toBeInTheDocument()
        expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('calls setIsGuidanceTemplatesModalOpen when "Start from template" is clicked', async () => {
        const user = userEvent.setup()
        const setIsGuidanceTemplatesModalOpen = jest.fn()

        render(
            <TrainButton
                {...defaultProps}
                setIsGuidanceTemplatesModalOpen={
                    setIsGuidanceTemplatesModalOpen
                }
            />,
        )

        const templateButton = screen.getByTestId(
            'dropdown-item-start_from_template',
        )
        await act(async () => {
            await user.click(templateButton)
        })

        expect(setIsGuidanceTemplatesModalOpen).toHaveBeenCalledWith(true)
    })

    it('calls onCustomGuidanceClick when "Custom" is clicked', async () => {
        const user = userEvent.setup()
        const onCustomGuidanceClick = jest.fn()

        render(
            <TrainButton
                {...defaultProps}
                onCustomGuidanceClick={onCustomGuidanceClick}
            />,
        )

        const customButton = screen.getByTestId('dropdown-item-custom')
        await act(async () => {
            await user.click(customButton)
        })

        expect(onCustomGuidanceClick).toHaveBeenCalled()
    })
})
