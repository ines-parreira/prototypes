import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import ProvinceInputNew from './ProvinceInputNew'

describe('ProvinceInputNew', () => {
    const defaultProps = {
        name: 'province',
        onChange: jest.fn(),
        country: 'United States',
        value: '',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when country has provinces', () => {
        it('should render dropdown with provinces', () => {
            render(<ProvinceInputNew {...defaultProps} />)

            expect(
                screen.getByText('Select state or province...'),
            ).toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText('Type state or province...'),
            ).not.toBeInTheDocument()
        })

        it('should display label when provided', () => {
            render(
                <ProvinceInputNew {...defaultProps} label="State/Province" />,
            )

            expect(screen.getByText('State/Province')).toBeInTheDocument()
        })

        it('should show required indicator when isRequired is true', () => {
            render(
                <ProvinceInputNew
                    {...defaultProps}
                    label="State/Province"
                    isRequired
                />,
            )

            expect(screen.getByText('State/Province')).toBeInTheDocument()
            expect(screen.getByText('*')).toBeInTheDocument()
        })

        it('should open dropdown when focused', async () => {
            render(<ProvinceInputNew {...defaultProps} />)

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText('Search'),
                ).toBeInTheDocument()
            })
        })

        it('should display provinces for United States', async () => {
            render(<ProvinceInputNew {...defaultProps} />)

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                expect(screen.getByText('Alabama')).toBeInTheDocument()
                expect(screen.getByText('California')).toBeInTheDocument()
                expect(screen.getByText('New York')).toBeInTheDocument()
            })
        })

        it('should call onChange when province is selected', async () => {
            const mockOnChange = jest.fn()
            render(
                <ProvinceInputNew {...defaultProps} onChange={mockOnChange} />,
            )

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                const californiaOption = screen.getByText('California')
                fireEvent.click(californiaOption)
            })

            expect(mockOnChange).toHaveBeenCalledWith('California')
        })

        it('should close dropdown after selection', async () => {
            const mockOnChange = jest.fn()
            render(
                <ProvinceInputNew {...defaultProps} onChange={mockOnChange} />,
            )

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                const californiaOption = screen.getByText('California')
                fireEvent.click(californiaOption)
            })

            await waitFor(() => {
                expect(
                    screen.queryByPlaceholderText('Search'),
                ).not.toBeInTheDocument()
            })
        })

        it('should display selected value', () => {
            render(<ProvinceInputNew {...defaultProps} value="California" />)

            expect(screen.getByText('California')).toBeInTheDocument()
        })

        it('should display error when hasError is true', () => {
            render(
                <ProvinceInputNew
                    {...defaultProps}
                    hasError
                    error="Province is required"
                />,
            )

            expect(screen.getByText('Province is required')).toBeInTheDocument()
        })

        it('should be disabled when disabled prop is true', () => {
            render(<ProvinceInputNew {...defaultProps} disabled />)

            const selectBox = screen.getByRole('combobox')
            expect(selectBox).toHaveAttribute('tabindex', '-1')
        })

        it('should filter provinces when searching', async () => {
            render(<ProvinceInputNew {...defaultProps} />)

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                const searchInput = screen.getByPlaceholderText('Search')
                userEvent.type(searchInput, 'cal')
            })

            await waitFor(() => {
                // The dropdown highlights search results by splitting text
                expect(screen.getByText('cal')).toBeInTheDocument()
                expect(screen.getByText('ifornia')).toBeInTheDocument()
                expect(screen.queryByText('Alabama')).not.toBeInTheDocument()
                expect(screen.queryByText('Texas')).not.toBeInTheDocument()
            })
        })

        it('should update provinces when country changes', async () => {
            const { rerender } = render(<ProvinceInputNew {...defaultProps} />)

            const selectBox = screen.getByRole('combobox')
            fireEvent.focus(selectBox)

            await waitFor(() => {
                expect(screen.getByText('California')).toBeInTheDocument()
            })

            fireEvent.keyDown(selectBox, { key: 'Escape' })

            rerender(<ProvinceInputNew {...defaultProps} country="Canada" />)

            const newSelectBox = screen.getByRole('combobox')
            fireEvent.focus(newSelectBox)

            await waitFor(() => {
                expect(screen.getByText('Ontario')).toBeInTheDocument()
                expect(screen.getByText('Quebec')).toBeInTheDocument()
                expect(screen.queryByText('California')).not.toBeInTheDocument()
            })
        })
    })

    describe('when country has no provinces', () => {
        const propsWithoutProvinces = {
            ...defaultProps,
            country: 'Monaco',
        }

        it('should render text input instead of dropdown', () => {
            render(<ProvinceInputNew {...propsWithoutProvinces} />)

            expect(
                screen.getByPlaceholderText('Type state or province...'),
            ).toBeInTheDocument()
            expect(
                screen.queryByPlaceholderText('Select state or province...'),
            ).not.toBeInTheDocument()
        })

        it('should display label when provided', () => {
            render(
                <ProvinceInputNew
                    {...propsWithoutProvinces}
                    label="State/Province"
                />,
            )

            expect(screen.getByLabelText('State/Province')).toBeInTheDocument()
        })

        it('should show required indicator when isRequired is true', () => {
            render(
                <ProvinceInputNew
                    {...propsWithoutProvinces}
                    label="State/Province"
                    isRequired
                />,
            )

            const input = screen.getByLabelText('State/Province*')
            expect(input).toBeInTheDocument()
        })

        it('should call onChange when typing', () => {
            const mockOnChange = jest.fn()
            render(
                <ProvinceInputNew
                    {...propsWithoutProvinces}
                    onChange={mockOnChange}
                />,
            )

            const input = screen.getByPlaceholderText(
                'Type state or province...',
            )
            fireEvent.change(input, { target: { value: 'Monaco City' } })

            expect(mockOnChange).toHaveBeenCalledWith('Monaco City')
        })

        it('should display value', () => {
            render(
                <ProvinceInputNew {...propsWithoutProvinces} value="Monaco" />,
            )

            const input = screen.getByPlaceholderText(
                'Type state or province...',
            )
            expect(input).toHaveValue('Monaco')
        })

        it('should display error when hasError is true', () => {
            render(
                <ProvinceInputNew
                    {...propsWithoutProvinces}
                    hasError
                    error="Province is required"
                />,
            )

            expect(screen.getByText('Province is required')).toBeInTheDocument()
        })

        it('should be disabled when disabled prop is true', () => {
            render(<ProvinceInputNew {...propsWithoutProvinces} disabled />)

            const input = screen.getByPlaceholderText(
                'Type state or province...',
            )
            expect(input).toBeDisabled()
        })
    })

    describe('edge cases', () => {
        it('should handle empty country gracefully', () => {
            render(<ProvinceInputNew {...defaultProps} country="" />)

            expect(
                screen.getByPlaceholderText('Type state or province...'),
            ).toBeInTheDocument()
        })

        it('should handle undefined country gracefully', () => {
            render(
                <ProvinceInputNew
                    {...defaultProps}
                    country={undefined as any}
                />,
            )

            expect(
                screen.getByPlaceholderText('Type state or province...'),
            ).toBeInTheDocument()
        })

        it('should handle country with empty provinces array', () => {
            render(
                <ProvinceInputNew
                    {...defaultProps}
                    country="Unknown Country"
                />,
            )

            expect(
                screen.getByPlaceholderText('Type state or province...'),
            ).toBeInTheDocument()
        })
    })
})
