import userEvent from '@testing-library/user-event'
import React from 'react'
import _debounce from 'lodash/debounce'

import {act, render, screen} from '@testing-library/react'
import {ReceiverValue} from 'state/ticket/utils'
import {isEmail} from 'utils'

import MultiSelectAsyncField from './MultiSelectAsyncField'

jest.mock('lodash/debounce', () =>
    jest.fn((fn: (...args: any[]) => void) => fn)
)

describe('MultiSelectAsyncField component', () => {
    const minProps = {
        value: [],
        onChange: jest.fn(),
        loadOptions: jest.fn(),
        allowCreate: true,
        allowCreateConstraint: isEmail,
        placeholder: 'I am the placeholder',
        onOptionSelect: jest.fn(),
    }

    it('empty items', () => {
        render(<MultiSelectAsyncField {...minProps} />)

        expect(document.querySelectorAll('.item').length).toEqual(0)
    })

    it('multiple items correct amount', () => {
        const values = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        render(<MultiSelectAsyncField {...minProps} value={values} />)

        expect(document.querySelectorAll('.item').length).toEqual(2)
    })

    it('multiple items correct content', () => {
        const values = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        render(<MultiSelectAsyncField {...minProps} value={values} />)

        values.forEach((item) => {
            expect(screen.getByText(item.label)).toBeInTheDocument()
        })
    })

    it('search for recipients on change input', () => {
        const options = [
            {
                label: 'Michel',
                name: 'Michel',
                value: 'michel@gorgias.com',
            },
            {
                label: 'Lucien',
                name: 'Lucien',
                value: 'lucien@gorgias.com',
            },
        ]

        const loadOptions = jest
            .fn()
            .mockImplementation(
                (_, callback: (options: ReceiverValue[]) => void) => {
                    callback(options)
                }
            )

        render(
            <MultiSelectAsyncField {...minProps} loadOptions={loadOptions} />
        )
        act(() => {
            userEvent.paste(screen.getByRole('textbox'), 'Something')
        })

        expect(loadOptions).toBeCalled()
    })

    it('add recipients on change input with multiple addresses', () => {
        const onChange = jest.fn()
        const value = [
            {
                label: 'Existing',
                name: 'Existing',
                value: 'existing@gorgias.io',
            },
        ]

        render(
            <MultiSelectAsyncField
                {...minProps}
                value={value}
                onChange={onChange}
            />
        )

        act(() => {
            userEvent.paste(
                screen.getByRole('textbox'),
                'alex@gorgias.io, Romain <romain@gorgias.io>, wrongaddress'
            )
        })

        expect(onChange).toBeCalledWith([
            value[0],
            {value: 'alex@gorgias.io'},
            {value: 'romain@gorgias.io', name: 'Romain'},
        ])
    })

    it('should call onOptionSelect on option click', () => {
        const receiver: ReceiverValue = {
            name: 'john',
            label: 'john',
            value: 'john.doe@example.com',
        }
        minProps.loadOptions.mockImplementation(
            (value, cb: (receivers: ReceiverValue[]) => void) => cb([receiver])
        )
        render(<MultiSelectAsyncField {...minProps} />)

        act(() => {
            userEvent.paste(screen.getByRole('textbox'), receiver.label)
        })
        act(() => {
            const suggestion = document.querySelector('.suggestion')
            if (suggestion) {
                userEvent.click(suggestion)
            }
        })

        expect(minProps.onOptionSelect).toHaveBeenLastCalledWith(receiver, 0)
    })

    it('should render a placeholder when opening the input', async () => {
        render(<MultiSelectAsyncField {...minProps} />)

        await act(async () => {
            await userEvent.type(screen.getByRole('textbox'), '')
        })

        expect(document.querySelector('.emptySuggestions')).toHaveTextContent(
            'Type to search'
        )
    })

    it('should display a loading skeleton when searching', () => {
        ;(
            _debounce as jest.MockedFunction<typeof _debounce>
        ).mockImplementationOnce((() => (fn: (...args: any[]) => void) => {
            setTimeout(fn)
        }) as any)
        render(<MultiSelectAsyncField {...minProps} />)

        act(() => {
            userEvent.paste(screen.getByRole('textbox'), 'john')
        })

        expect(document.getElementsByClassName('skeleton').length).toEqual(3)
    })

    it('should render no results when the query returns no result', () => {
        minProps.loadOptions.mockImplementation(
            (value, cb: (receivers: ReceiverValue[]) => void) => cb([])
        )
        render(<MultiSelectAsyncField {...minProps} />)

        act(() => {
            userEvent.paste(screen.getByRole('textbox'), 'Something')
        })

        expect(document.querySelector('.emptySuggestions')).toHaveTextContent(
            'No results'
        )
    })
})
