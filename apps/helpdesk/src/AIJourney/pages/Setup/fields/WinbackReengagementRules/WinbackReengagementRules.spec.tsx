import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { WinbackReengagementRulesField } from './WinbackReengagementRules'

describe('WinbackReengagementRulesField', () => {
    describe('inactive_days type', () => {
        it('should render with correct field name', () => {
            render(<WinbackReengagementRulesField type="inactive_days" />)

            expect(screen.getByText('Inactive Days')).toBeInTheDocument()
        })

        it('should render selector with correct value', () => {
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={30}
                />,
            )

            expect(
                screen.getByRole('button', { name: '30' }),
            ).toBeInTheDocument()
        })

        it('should call onChange when selector value changes', async () => {
            const handleChange = jest.fn()
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={30}
                    onChange={handleChange}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: '60' })),
            )

            expect(handleChange).toHaveBeenCalledWith(60)
        })
    })

    describe('cooldown_days type', () => {
        it('should render with correct field name', () => {
            render(<WinbackReengagementRulesField type="cooldown_days" />)

            expect(screen.getByText('Cooldown Period')).toBeInTheDocument()
        })

        it('should render selector with correct value', () => {
            render(
                <WinbackReengagementRulesField
                    type="cooldown_days"
                    value={90}
                />,
            )

            expect(
                screen.getByRole('button', { name: '90' }),
            ).toBeInTheDocument()
        })

        it('should call onChange when selector value changes', async () => {
            const handleChange = jest.fn()
            render(
                <WinbackReengagementRulesField
                    type="cooldown_days"
                    value={60}
                    onChange={handleChange}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: '90' })),
            )

            expect(handleChange).toHaveBeenCalledWith(90)
        })
    })

    describe('selector options', () => {
        it('should render all available options', () => {
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={30}
                />,
            )

            expect(
                screen.getByRole('button', { name: '30' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: '60' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: '90' }),
            ).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle null value', () => {
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={null}
                />,
            )

            expect(screen.getByText('Inactive Days')).toBeInTheDocument()
        })

        it('should handle undefined value', () => {
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={undefined}
                />,
            )

            expect(screen.getByText('Inactive Days')).toBeInTheDocument()
        })

        it('should not call onChange when it is not provided', async () => {
            render(
                <WinbackReengagementRulesField
                    type="inactive_days"
                    value={30}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: '60' })),
            )

            expect(
                screen.getByRole('button', { name: '60' }),
            ).toBeInTheDocument()
        })
    })
})
