import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useAxiomMigration } from 'hooks/useAxiomMigration'

import ChatAvailabilitySelection from './ChatAvailabilitySelection'

jest.mock('hooks/useAxiomMigration', () => ({
    useAxiomMigration: jest.fn(),
}))

const useAxiomMigrationMock = useAxiomMigration as jest.Mock

describe('ChatAvailabilitySelection', () => {
    const defaultProps = {
        value: 'online' as const,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useAxiomMigrationMock.mockReturnValue({ isEnabled: false })
    })

    it('should render label and both radio buttons', () => {
        render(<ChatAvailabilitySelection {...defaultProps} />)

        expect(screen.getByText('Availability')).toBeInTheDocument()
        expect(screen.getByLabelText('Online')).toBeInTheDocument()
        expect(screen.getByLabelText('Offline')).toBeInTheDocument()
    })

    it('should render with online selected', () => {
        render(<ChatAvailabilitySelection {...defaultProps} value="online" />)

        const onlineRadio = screen.getByLabelText('Online')
        const offlineRadio = screen.getByLabelText('Offline')

        expect(onlineRadio).toBeChecked()
        expect(offlineRadio).not.toBeChecked()
    })

    it('should render with offline selected', () => {
        render(<ChatAvailabilitySelection {...defaultProps} value="offline" />)

        const onlineRadio = screen.getByLabelText('Online')
        const offlineRadio = screen.getByLabelText('Offline')

        expect(offlineRadio).toBeChecked()
        expect(onlineRadio).not.toBeChecked()
    })

    it('should call onChange with online when online radio button is clicked', async () => {
        render(<ChatAvailabilitySelection {...defaultProps} value="offline" />)

        const onlineRadio = screen.getByLabelText('Online')

        await act(async () => {
            await userEvent.click(onlineRadio)
        })

        expect(defaultProps.onChange).toHaveBeenCalledWith('online')
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
    })

    it('should call onChange with offline when offline radio button is clicked', async () => {
        render(<ChatAvailabilitySelection {...defaultProps} value="online" />)

        const offlineRadio = screen.getByLabelText('Offline')

        await act(async () => {
            await userEvent.click(offlineRadio)
        })

        expect(defaultProps.onChange).toHaveBeenCalledWith('offline')
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1)
    })

    it('should update selection when value prop changes', () => {
        const { rerender } = render(
            <ChatAvailabilitySelection {...defaultProps} value="online" />,
        )

        expect(screen.getByLabelText('Online')).toBeChecked()
        expect(screen.getByLabelText('Offline')).not.toBeChecked()

        act(() => {
            rerender(
                <ChatAvailabilitySelection {...defaultProps} value="offline" />,
            )
        })

        expect(screen.getByLabelText('Online')).not.toBeChecked()
        expect(screen.getByLabelText('Offline')).toBeChecked()
    })

    it('should have correct radio button types', () => {
        render(<ChatAvailabilitySelection {...defaultProps} />)

        const onlineRadio = screen.getByLabelText('Online')
        const offlineRadio = screen.getByLabelText('Offline')

        expect(onlineRadio).toHaveAttribute('type', 'radio')
        expect(offlineRadio).toHaveAttribute('type', 'radio')
    })

    describe('Axiom migration scenarios', () => {
        it('should not apply axios class when Axiom is disabled', () => {
            useAxiomMigrationMock.mockReturnValue({ isEnabled: false })

            const { container } = render(
                <ChatAvailabilitySelection {...defaultProps} />,
            )

            const element = container.querySelector(
                '.chatAvailabilitySelection',
            )
            expect(element).toBeInTheDocument()
            expect(element).not.toHaveClass('axios')
        })

        it('should apply axios class when Axiom is enabled', () => {
            useAxiomMigrationMock.mockReturnValue({ isEnabled: true })

            const { container } = render(
                <ChatAvailabilitySelection {...defaultProps} />,
            )

            const element = container.querySelector(
                '.chatAvailabilitySelection',
            )
            expect(element).toBeInTheDocument()
            expect(element).toHaveClass('axios')
        })

        it('should update CSS class when Axiom is toggled', () => {
            useAxiomMigrationMock.mockReturnValue({ isEnabled: false })

            const { container, rerender } = render(
                <ChatAvailabilitySelection {...defaultProps} />,
            )

            const element = container.querySelector(
                '.chatAvailabilitySelection',
            )
            expect(element).not.toHaveClass('axios')

            useAxiomMigrationMock.mockReturnValue({ isEnabled: true })

            act(() => {
                rerender(<ChatAvailabilitySelection {...defaultProps} />)
            })

            expect(element).toHaveClass('axios')
        })

        it('should maintain functionality when Axiom is enabled', async () => {
            useAxiomMigrationMock.mockReturnValue({ isEnabled: true })

            render(
                <ChatAvailabilitySelection {...defaultProps} value="online" />,
            )

            const offlineRadio = screen.getByLabelText('Offline')

            await act(async () => {
                await userEvent.click(offlineRadio)
            })

            expect(defaultProps.onChange).toHaveBeenCalledWith('offline')
        })

        it('should render all elements correctly when Axiom is enabled', () => {
            useAxiomMigrationMock.mockReturnValue({ isEnabled: true })

            render(<ChatAvailabilitySelection {...defaultProps} />)

            expect(screen.getByText('Availability')).toBeInTheDocument()
            expect(screen.getByLabelText('Online')).toBeInTheDocument()
            expect(screen.getByLabelText('Offline')).toBeInTheDocument()
        })
    })
})
