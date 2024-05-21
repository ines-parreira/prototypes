import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import Parameters from '../Parameters'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

describe('<Parameters/>', () => {
    const props = {
        onChange: jest.fn(),
        path: 'path',
        value: [
            {
                key: 'key',
                value: 'value',
                label: 'label',
                editable: false,
                mandatory: false,
            },
        ],
    }

    it('should call onChange when adding a new parameter', () => {
        render(<Parameters {...{...props, value: []}} />)

        fireEvent.click(
            screen.getByRole('button', {
                name: 'add Parameter',
            })
        )
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            {
                id: 'ulid-generated-id',
                key: '',
                value: '',
                label: '',
                editable: false,
                mandatory: false,
            },
        ])
    })

    it('should display an error message when having duplicate keys', () => {
        render(
            <Parameters
                {...{...props, value: [props.value[0], props.value[0]]}}
            />
        )

        expect(screen.getByText(/you have duplicate keys/))
    })

    it.each(['key', 'value', 'label'])(
        'should call onChange when changing %s',
        (field) => {
            render(<Parameters {...props} />)
            const newValue = 'newValue'
            fireEvent.change(screen.getByDisplayValue(field), {
                target: {value: newValue},
            })
            expect(props.onChange).toHaveBeenCalledWith(
                `${props.path}[0].${field}`,
                newValue
            )
        }
    )

    it('should call onChange when clicking editable', () => {
        render(<Parameters {...props} />)
        fireEvent.click(screen.getByLabelText('Editable'))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[0].editable`,
            true
        )
    })

    it('should enable the mandatory button conditionally and call onChange when clicking it', () => {
        const {rerender} = render(<Parameters {...props} />)
        expect(
            screen.getByLabelText('Editable').getAttribute('disabled')
        ).toBeDefined()

        rerender(
            <Parameters
                {...{...props, value: [{...props.value[0], editable: true}]}}
            />
        )
        expect(
            screen.getByLabelText('Required').getAttribute('disabled')
        ).toBeFalsy()
        fireEvent.click(screen.getByLabelText('Required'))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[0].mandatory`,
            true
        )
    })

    it('should call onChange when removing param', () => {
        render(<Parameters {...props} />)
        fireEvent.click(screen.getByRole('button', {name: 'close'}))
        expect(props.onChange).toHaveBeenCalledWith(props.path, [])
    })

    it('should call onChange when try to render a param without ID', () => {
        render(<Parameters {...props} />)
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            {
                key: 'key',
                id: 'ulid-generated-id',
                value: 'value',
                label: 'label',
                editable: false,
                mandatory: false,
            },
        ])
    })

    it('should call onChange when removing param and remove the correct value', () => {
        const multipleParams = {
            onChange: jest.fn(),
            path: 'path',
            value: [
                {
                    key: 'keyA',
                    value: 'value',
                    label: 'label',
                    editable: false,
                    mandatory: false,
                },
                {
                    key: 'keyB',
                    value: 'value',
                    label: 'label',
                    editable: false,
                    mandatory: false,
                },
            ],
        }

        render(<Parameters {...multipleParams} />)
        fireEvent.click(screen.getByTestId('delete-1'))
        expect(multipleParams.onChange).toHaveBeenCalledWith(props.path, [
            {
                key: 'keyA',
                value: 'value',
                label: 'label',
                editable: false,
                mandatory: false,
            },
        ])
    })
})
