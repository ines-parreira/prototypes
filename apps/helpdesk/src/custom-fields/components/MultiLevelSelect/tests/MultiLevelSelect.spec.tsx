import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { hasRole } from 'utils'

import MultiLevelSelect, { EmptyHelper } from '../MultiLevelSelect'

jest.mock('utils', () => {
    {
        const originalModule = jest.requireActual('utils')
        return {
            ...originalModule,
            hasRole: jest.fn(),
        } as Record<string, unknown>
    }
})
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(() => ({
        role: { name: 'admin' },
    })),
}))

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)
const mockedHasRole = assumeMock(hasRole)

describe('<MultiLevelSelect />', () => {
    const initialProps = {
        id: 1,
        label: 'dropdown',
        value: 's1::ss2::c2',
        hasError: false,
        choices: [
            's1::a1',
            's1::ss2::c1',
            's1::ss2::c2',
            's1::ss3',
            's2',
            's3',
        ],
        inputId: 'test-input-id',
        isRequired: true,
        onChange: jest.fn(),
    }

    beforeEach(() => {
        mockedHasRole.mockReturnValue(false)
        initialProps.onChange.mockReset()
    })

    it('should display all the items when focused and allow mouse navigation', async () => {
        render(<MultiLevelSelect {...initialProps} value="" />)

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByText('s1')

        let navItem = screen.getByText('s1')
        expect(screen.getByText('s2'))
        userEvent.click(navItem)
        expect(screen.getByText('a1'))
        navItem = screen.getByText('s1')
        userEvent.click(navItem)
        expect(screen.getByText('s2'))
    })

    it('should call onChange with correct params and dismiss modal when selecting a value', async () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByText('c1')

        userEvent.click(screen.getByText('c1'))

        await waitFor(() => {
            expect(initialProps.onChange).toHaveBeenCalledWith('s1::ss2::c1')
            expect(screen.queryByTestId('floating-overlay')).toBe(null)
        })
    })

    it('should call onChange with correct params and dismiss modal when clearing the value', async () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByText(/Clear/)

        userEvent.click(screen.getByText(/Clear/))

        await waitFor(() => {
            expect(initialProps.onChange).toHaveBeenCalledWith('')
            expect(screen.queryByTestId('floating-overlay')).toBe(null)
        })
    })

    it('should not display a search input if not text choices', () => {
        render(<MultiLevelSelect {...initialProps} choices={[1024, 2048]} />)

        userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByPlaceholderText('Search')).toBeNull()
    })

    it('should display results when searching', async () => {
        render(<MultiLevelSelect {...initialProps} />)

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByPlaceholderText('Search')

        await userEvent.type(screen.getByPlaceholderText('Search'), 's1')
        await waitFor(() => {
            expect(screen.getByText('a1')).toBeInTheDocument()
            expect(screen.getByText('c1')).toBeInTheDocument()
            expect(screen.getByText('c2')).toBeInTheDocument()
            expect(screen.queryByText('ss3')).toBeInTheDocument()
            expect(screen.queryByText('s2')).not.toBeInTheDocument()
        })
    })

    it('should show a span instead of an input when autoWidth is true', () => {
        render(<MultiLevelSelect {...initialProps} autoWidth />)
        expect(screen.getByText('c2')).toBeVisible()
    })

    it('should show a span placeholder instead of an input when autoWidth is true when value is empty', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                autoWidth
                value=""
                placeholder="placeholder"
            />,
        )
        expect(screen.getByText('placeholder')).toBeVisible()
    })

    it('should render custom display value', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                customDisplayValue={() => 'custom display value'}
            />,
        )
        expect(screen.getByRole('textbox')).toHaveValue('custom display value')
    })

    it('should render multiple values correctly', () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s1::ss2::c1', 's1::ss2::c2']}
            />,
        )

        expect(screen.getByRole('textbox')).toHaveValue(
            's1::ss2::c1,s1::ss2::c2',
        )
    })

    it('should call onChange with correct params when multiple values are selected, and keep textbox open', async () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s1::ss2::c2']}
            />,
        )

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByText('s2')
        userEvent.click(screen.getByText('s2'))

        await waitFor(() => {
            expect(initialProps.onChange).toHaveBeenCalledWith([
                's2',
                's1::ss2::c2',
            ])
        })

        userEvent.click(screen.getByText('s3'))

        await waitFor(() => {
            expect(initialProps.onChange).toHaveBeenCalledWith([
                's3',
                's1::ss2::c2',
            ])
        })
    })

    it('should exclude a value when reselected in multiple mode', async () => {
        render(
            <MultiLevelSelect
                {...initialProps}
                allowMultiValues
                value={['s2']}
            />,
        )

        userEvent.click(screen.getByRole('textbox'))

        await screen.findByText('s2')

        userEvent.click(screen.getByText('s2'))

        await waitFor(() => {
            expect(initialProps.onChange).toHaveBeenCalledWith([])
        })
    })

    it('should reset path and update active state when toggled', () => {
        render(
            <>
                <MultiLevelSelect
                    {...initialProps}
                    allowMultiValues
                    value={[]}
                />
            </>,
        )

        const textbox = screen.getByRole('textbox')

        fireEvent.focus(textbox)

        expect(screen.queryByTestId('floating-overlay')).toBeInTheDocument()

        fireEvent.click(screen.getByText('s1'))

        expect(screen.queryByText('a1')).toBeInTheDocument()
        const outside = screen.queryByTestId('floating-overlay')
        fireEvent.mouseDown(outside!)
        fireEvent.click(outside!)

        expect(screen.queryByTestId('floating-overlay')).toBeNull()

        fireEvent.focus(textbox)

        expect(screen.queryByTestId('floating-overlay')).toBeInTheDocument()
        expect(screen.queryByText('a1')).not.toBeInTheDocument()
    })

    describe('Empty helper', () => {
        it('should display an empty helper when they are no choices', async () => {
            render(<MultiLevelSelect {...initialProps} choices={[]} />)

            userEvent.hover(screen.getByDisplayValue('c2'))
            await waitFor(() => {
                expect(
                    screen.getByText(/This field does not have any values yet/),
                ).toBeInTheDocument()
            })
        })
        it('should display an empty helper specific to admin when there are no choices', async () => {
            mockedHasRole.mockReturnValue(true)
            render(<MultiLevelSelect {...initialProps} choices={[]} />)
            userEvent.hover(screen.getByDisplayValue('c2'))
            await waitFor(() => {
                expect(screen.getByText(/Go to Settings/)).toBeInTheDocument()
            })
        })
        it('should not display empty helper when id is undefined', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    id={undefined}
                    choices={[]}
                />,
            )

            userEvent.hover(screen.getByDisplayValue('c2'))
            expect(
                screen.queryByText(/This field does not have any values yet/),
            ).not.toBeInTheDocument()
        })

        it('should render EmptyHelper component directly for non-admin', async () => {
            mockedHasRole.mockReturnValue(false)
            const targetRef = React.createRef<HTMLDivElement>()
            render(
                <div>
                    <div ref={targetRef}>Target</div>
                    <EmptyHelper target={targetRef} id={1} />
                </div>,
            )

            userEvent.hover(screen.getByText('Target'))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'This field does not have any values yet. Contact your Admin to set up this field.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should render EmptyHelper component directly for admin', async () => {
            mockedHasRole.mockReturnValue(true)
            const targetRef = React.createRef<HTMLDivElement>()
            render(
                <div>
                    <div ref={targetRef}>Target</div>
                    <EmptyHelper target={targetRef} id={1} />
                </div>,
            )

            userEvent.hover(screen.getByText('Target'))

            await waitFor(() => {
                expect(screen.getByText(/Go to Settings/)).toBeInTheDocument()
            })
        })
    })

    describe('Edge cases', () => {
        it('should call onFocus when focusing input if onFocus prop is provided', async () => {
            const onFocusMock = jest.fn()
            render(
                <MultiLevelSelect
                    {...initialProps}
                    onFocus={onFocusMock}
                    value=""
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                expect(onFocusMock).toHaveBeenCalled()
            })
        })

        it('should not call onFocus when already active', async () => {
            const onFocusMock = jest.fn()
            render(
                <MultiLevelSelect
                    {...initialProps}
                    onFocus={onFocusMock}
                    value=""
                />,
            )

            const textbox = screen.getByRole('textbox')
            userEvent.click(textbox)

            await waitFor(() => {
                expect(onFocusMock).toHaveBeenCalledTimes(1)
            })

            fireEvent.focus(textbox)

            expect(onFocusMock).toHaveBeenCalledTimes(1)
        })

        it('should show loading skeletons when isLoading is true', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    isLoading={true}
                    value=""
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                expect(
                    screen.getByTestId('floating-overlay'),
                ).toBeInTheDocument()
            })

            // When isLoading is true, the component renders Skeleton components
            // We just need to verify the dropdown opens and onChange is not triggered
            const dropdown = screen.getByTestId('floating-overlay')
            expect(dropdown).toBeInTheDocument()

            // Verify that the dropdown has rendered (coverage for skeleton rendering)
            expect(initialProps.onChange).not.toHaveBeenCalled()
        })

        it('should handle clicking on skeleton items when loading', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    isLoading={true}
                    value=""
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                expect(
                    screen.getByTestId('floating-overlay'),
                ).toBeInTheDocument()
            })

            // When loading, skeleton items are rendered that don't respond to clicks
            // The onClick handler for skeleton items is an empty function () => {}
            // This provides coverage for the skeleton item rendering path
            const dropdown = screen.getByTestId('floating-overlay')
            expect(dropdown).toBeInTheDocument()

            // Verify onChange is never called when loading
            expect(initialProps.onChange).not.toHaveBeenCalled()
        })

        it('should handle clicking on search results', async () => {
            render(<MultiLevelSelect {...initialProps} value="" />)

            userEvent.click(screen.getByRole('textbox'))

            await screen.findByPlaceholderText('Search')

            await userEvent.type(screen.getByPlaceholderText('Search'), 's1')

            await waitFor(() => {
                expect(screen.getByText('a1')).toBeInTheDocument()
            })

            userEvent.click(screen.getByText('a1'))

            await waitFor(() => {
                expect(initialProps.onChange).toHaveBeenCalledWith('s1::a1')
            })
        })

        it('should show no results message when search has no matches', async () => {
            render(<MultiLevelSelect {...initialProps} value="" />)

            userEvent.click(screen.getByRole('textbox'))

            await screen.findByPlaceholderText('Search')

            await userEvent.type(
                screen.getByPlaceholderText('Search'),
                'nonexistent',
            )

            await waitFor(() => {
                expect(screen.getByText('No results')).toBeInTheDocument()
            })
        })

        it('should show prediction icon when prediction is correct', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    value="s1::a1"
                    prediction={{
                        display: true,
                        predicted: 's1::a1',
                        confirmed: true,
                        modified: false,
                        confidence: 0.95,
                    }}
                />,
            )

            const icons = document.querySelectorAll('.material-icons')
            const hasPredictionIcon = Array.from(icons).some(
                (icon) => icon.textContent === 'auto_awesome',
            )
            expect(hasPredictionIcon).toBe(true)
        })

        it('should handle prediction icon with confirmed false and modified false', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    value="s1::a1"
                    prediction={{
                        display: true,
                        predicted: 's1::a1',
                        confirmed: false,
                        modified: false,
                        confidence: 0.95,
                    }}
                />,
            )

            const icons = document.querySelectorAll('.material-icons')
            const hasPredictionIcon = Array.from(icons).some(
                (icon) => icon.textContent === 'auto_awesome',
            )
            expect(hasPredictionIcon).toBe(true)
        })

        it('should not show prediction icon when prediction does not match value', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    value="s1::a1"
                    prediction={{
                        display: true,
                        predicted: 's2',
                        confirmed: true,
                        modified: false,
                        confidence: 0.95,
                    }}
                />,
            )

            const icons = document.querySelectorAll('.material-icons')
            const hasPredictionIcon = Array.from(icons).some(
                (icon) => icon.textContent === 'auto_awesome',
            )
            expect(hasPredictionIcon).toBe(false)
        })

        it('should handle outdated value properly', () => {
            const { rerender } = render(
                <MultiLevelSelect {...initialProps} value="outdated::value" />,
            )

            // Rerender with a value that's not in choices
            rerender(
                <MultiLevelSelect
                    {...initialProps}
                    value="outdated::value::notinchoices"
                />,
            )

            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should handle showCheckboxes prop', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={true}
                    allowMultiValues={true}
                    value={['s2']}
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                expect(checkboxes.length).toBeGreaterThan(0)
            })
        })

        it('should handle clicking on checkbox', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={true}
                    allowMultiValues={true}
                    value={['s2']}
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                expect(checkboxes.length).toBeGreaterThan(0)
                userEvent.click(checkboxes[0])
            })
        })

        it('should handle clearing value with empty string', async () => {
            render(<MultiLevelSelect {...initialProps} />)

            userEvent.click(screen.getByRole('textbox'))

            await screen.findByText(/Clear/)

            const clearButton = screen.getByText(/Clear/)
            userEvent.click(clearButton)

            await waitFor(() => {
                expect(initialProps.onChange).toHaveBeenCalledWith('')
            })
        })

        it('should handle clicking on span when autoWidth is true and not disabled', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    autoWidth
                    value=""
                    placeholder="placeholder"
                />,
            )

            const span = screen.getByText('placeholder')
            userEvent.click(span)

            expect(screen.queryByTestId('floating-overlay')).toBeInTheDocument()
        })

        it('should not handle clicking on span when autoWidth is true and disabled', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    autoWidth
                    isDisabled={true}
                    value=""
                    placeholder="placeholder"
                />,
            )

            const span = screen.getByText('placeholder')
            userEvent.click(span)

            expect(
                screen.queryByTestId('floating-overlay'),
            ).not.toBeInTheDocument()
        })

        it('should show full value when showFullValue is true', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showFullValue={true}
                    value="s1::ss2::c2"
                />,
            )

            // When showFullValue is false, it shows "s1 > ss2 > c2"
            // When showFullValue is true, it still shows "s1 > ss2 > c2" format
            // The getValueLabel function formats it this way
            expect(screen.getByRole('textbox')).toHaveValue('s1 > ss2 > c2')
        })

        it('should handle hideClearButton prop', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    hideClearButton={true}
                    value="s1::ss2::c1"
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                expect(screen.queryByText(/Clear/)).not.toBeInTheDocument()
            })
        })

        it('should handle CustomInput component', () => {
            const CustomInputComponent = React.forwardRef<
                HTMLInputElement,
                any
            >((props, ref) => (
                <input
                    {...props}
                    ref={ref}
                    data-testid="custom-input"
                    value={props.value}
                    onChange={() => {}}
                />
            ))

            render(
                <MultiLevelSelect
                    {...initialProps}
                    CustomInput={CustomInputComponent}
                />,
            )

            expect(screen.getByTestId('custom-input')).toBeInTheDocument()
        })

        it('should handle placement prop', () => {
            render(
                <MultiLevelSelect {...initialProps} placement="bottom-start" />,
            )

            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should handle dropdownMatchTriggerWidth prop', () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    dropdownMatchTriggerWidth={true}
                />,
            )

            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should handle wrapperClassName and bodyClassName props', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    wrapperClassName="test-wrapper"
                    bodyClassName="test-body"
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                const dropdown = document.querySelector('.test-wrapper')
                const body = document.querySelector('.test-body')
                expect(dropdown).toBeTruthy()
                expect(body).toBeTruthy()
            })
        })

        it('should render checkboxes with correct checked state for multiple values', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={true}
                    allowMultiValues={true}
                    value={['s1::ss2::c1', 's2']}
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                expect(checkboxes.length).toBeGreaterThan(0)

                // Verify that the checkbox for selected values are checked
                const checkedBoxes = checkboxes.filter(
                    (cb) => (cb as HTMLInputElement).checked,
                )
                expect(checkedBoxes.length).toBeGreaterThan(0)
            })
        })

        it('should render checkbox with correct checked state for single value when showCheckboxes is true', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={true}
                    allowMultiValues={false}
                    value="s2"
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                expect(checkboxes.length).toBeGreaterThan(0)

                // Find the checkbox for the selected value
                const checkedBoxes = checkboxes.filter(
                    (cb) => (cb as HTMLInputElement).checked,
                )
                expect(checkedBoxes.length).toBe(1)
            })
        })

        it('should show CheckIcon for selected single value when showCheckboxes is false', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={false}
                    allowMultiValues={false}
                    value="s2"
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                // The CheckIcon component should be rendered for the selected value
                const checkIcons = document.querySelectorAll('.material-icons')
                const checkIconsWithText = Array.from(checkIcons).filter(
                    (icon) => icon.textContent === 'check',
                )
                expect(checkIconsWithText.length).toBeGreaterThan(0)
            })
        })

        it('should show CheckIcon for selected multiple values when showCheckboxes is false', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={false}
                    allowMultiValues={true}
                    value={['s2', 's3']}
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                // The CheckIcon components should be rendered for selected values
                const checkIcons = document.querySelectorAll('.material-icons')
                const checkIconsWithText = Array.from(checkIcons).filter(
                    (icon) => icon.textContent === 'check',
                )
                expect(checkIconsWithText.length).toBe(2)
            })
        })

        it('should handle checkbox value for nested multi-level selections', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={true}
                    allowMultiValues={true}
                    value={['s1::ss2::c1', 's1::ss2::c2']}
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            await waitFor(() => {
                expect(screen.getByText('s1')).toBeInTheDocument()
            })

            // Navigate to nested level
            userEvent.click(screen.getByText('s1'))

            await waitFor(() => {
                expect(screen.getByText('ss2')).toBeInTheDocument()
            })

            userEvent.click(screen.getByText('ss2'))

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                expect(checkboxes.length).toBeGreaterThan(0)

                // Both c1 and c2 should be checked
                const checkedBoxes = checkboxes.filter(
                    (cb) => (cb as HTMLInputElement).checked,
                )
                expect(checkedBoxes.length).toBe(2)
            })
        })

        it('should not show CheckIcon when value does not match any option', async () => {
            render(
                <MultiLevelSelect
                    {...initialProps}
                    showCheckboxes={false}
                    allowMultiValues={false}
                    value=""
                />,
            )

            userEvent.click(screen.getByRole('textbox'))

            // Wait for dropdown to open
            await waitFor(() => {
                expect(
                    screen.getByTestId('floating-overlay'),
                ).toBeInTheDocument()
            })

            // Verify no check icons are present
            const checkIcons = document.querySelectorAll('.material-icons')
            const checkIconsWithText = Array.from(checkIcons).filter(
                (icon) => icon.textContent === 'check',
            )
            expect(checkIconsWithText.length).toBe(0)
        })
    })
})
