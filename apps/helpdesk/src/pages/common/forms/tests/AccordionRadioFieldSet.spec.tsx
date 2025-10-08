import React from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AccordionRadioFieldSet from '../AccordionRadioFieldSet'

describe('<AccordionRadioFieldSet />', () => {
    const minProps = {
        options: [
            {
                label: 'Standard routing',
                value: 'standard',
                caption: 'Route calls to available agents',
            },
            {
                label: 'Priority routing',
                value: 'priority',
                caption: 'Route VIP customers first',
            },
        ],
        value: 'standard',
        onChange: jest.fn(),
    }

    describe('render()', () => {
        it('should render radio options', () => {
            render(<AccordionRadioFieldSet {...minProps} />)

            expect(
                screen.getByRole('radio', { name: /Standard routing/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: /Priority routing/i }),
            ).toBeInTheDocument()
        })

        it('should render a disabled fieldset', () => {
            render(<AccordionRadioFieldSet {...minProps} isDisabled />)

            expect(
                screen.getByRole('radio', { name: /Standard routing/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('radio', { name: /Priority routing/i }),
            ).toBeDisabled()
        })

        it('should render captions under radio buttons', () => {
            render(<AccordionRadioFieldSet {...minProps} />)

            expect(
                screen.getByText('Route calls to available agents'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Route VIP customers first'),
            ).toBeInTheDocument()
        })

        it('should render with body content', () => {
            const propsWithBody = {
                ...minProps,
                options: [
                    {
                        ...minProps.options[0],
                        body: <div>Additional details</div>,
                    },
                ],
            }
            render(<AccordionRadioFieldSet {...propsWithBody} />)

            expect(screen.getByText('Additional details')).toBeInTheDocument()
        })

        it('should render with default expanded item', () => {
            const propsWithBody = {
                ...minProps,
                defaultExpandedItem: 'standard',
                options: [
                    {
                        ...minProps.options[0],
                        body: <div>Expanded content</div>,
                    },
                ],
            }
            render(<AccordionRadioFieldSet {...propsWithBody} />)

            expect(screen.getByText('Expanded content')).toBeInTheDocument()
        })

        it('should render disabled option', () => {
            const propsWithDisabled = {
                ...minProps,
                options: [
                    minProps.options[0],
                    {
                        ...minProps.options[1],
                        disabled: true,
                    },
                ],
            }
            render(<AccordionRadioFieldSet {...propsWithDisabled} />)

            const disabledRadio = screen.getByRole('radio', {
                name: /Priority routing/i,
            })
            expect(disabledRadio).toBeDisabled()
        })

        it('should render selected option', () => {
            render(<AccordionRadioFieldSet {...minProps} value="priority" />)

            const selectedRadio = screen.getByRole('radio', {
                name: /Priority routing/i,
            })
            expect(selectedRadio).toBeChecked()
        })
    })

    describe('onChange()', () => {
        it('should call onChange when clicking on a radio button', async () => {
            render(<AccordionRadioFieldSet {...minProps} />)

            const radio = screen.getByRole('radio', {
                name: /Priority routing/i,
            })

            act(() => {
                userEvent.click(radio)
            })

            await waitFor(() => {
                expect(minProps.onChange).toHaveBeenCalledWith('priority')
            })
        })

        it('should not call onChange when clicking on disabled radio button', async () => {
            const propsWithDisabled = {
                ...minProps,
                options: [
                    minProps.options[0],
                    {
                        ...minProps.options[1],
                        disabled: true,
                    },
                ],
            }
            render(<AccordionRadioFieldSet {...propsWithDisabled} />)

            const disabledRadio = screen.getByRole('radio', {
                name: /Priority routing/i,
            })

            act(() => {
                userEvent.click(disabledRadio)
            })

            await waitFor(() => {
                expect(minProps.onChange).not.toHaveBeenCalled()
            })
        })

        it('should not call onChange when fieldset is disabled', async () => {
            render(<AccordionRadioFieldSet {...minProps} isDisabled />)

            const radio = screen.getByRole('radio', {
                name: /Priority routing/i,
            })

            act(() => {
                userEvent.click(radio)
            })

            await waitFor(() => {
                expect(minProps.onChange).not.toHaveBeenCalled()
            })
        })
    })

    describe('Accordion behavior', () => {
        it('should render body content for expandable item', () => {
            const propsWithBody = {
                ...minProps,
                options: [
                    {
                        ...minProps.options[0],
                        body: <div>Body content</div>,
                    },
                ],
            }
            render(<AccordionRadioFieldSet {...propsWithBody} />)

            expect(screen.getByText('Body content')).toBeInTheDocument()
        })

        it('should not show toggle icon when no body content', () => {
            const { container } = render(
                <AccordionRadioFieldSet {...minProps} />,
            )

            const toggleIcons = container.querySelectorAll('.material-icons')
            expect(toggleIcons).toHaveLength(0)
        })
    })
})
