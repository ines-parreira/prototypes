import {render, fireEvent, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock, getLastMockCall} from 'utils/testing'

import Parameter from '../Parameter'
import Parameters from '../Parameters'

jest.mock('../Parameter', () => jest.fn(() => null))
jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})
jest.mock('ulidx', () => ({
    ulid: jest.fn(() => 'ulid-generated-id'),
}))

const ParameterMock = assumeMock(Parameter)

describe('<Parameters/>', () => {
    const props = {
        onChange: jest.fn(),
        path: 'path',
        value: [
            {
                key: 'key1',
                value: 'value1',
                label: 'label1',
                editable: false,
                mandatory: false,
            },
            {
                key: 'key2',
                value: 'value2',
                label: 'label2',
                editable: false,
                mandatory: false,
            },
        ],
    }

    it('should call onChange when adding a new parameter', () => {
        render(<Parameters {...{...props, value: []}} />)

        fireEvent.click(
            screen.getByRole('button', {
                name: /Add Parameter/,
            })
        )
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            {
                id: 'ulid-generated-id',
                key: '',
                value: '',
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

    it('should call onChange when try to render a param without ID', () => {
        render(<Parameters {...props} />)
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            {
                key: 'key1',
                id: 'ulid-generated-id',
                value: 'value1',
                label: 'label1',
                editable: false,
                mandatory: false,
            },
            {
                key: 'key2',
                id: 'ulid-generated-id',
                value: 'value2',
                label: 'label2',
                editable: false,
                mandatory: false,
            },
        ])
    })

    it('should pass correct set of params to Parameter', () => {
        render(<Parameters {...props} />)
        expect(getLastMockCall(ParameterMock)[0]).toEqual({
            parameter: props.value[1],
            path: props.path,
            index: 1,
            onChange: props.onChange,
            debouncedOnChange: expect.any(Function),
            onDelete: expect.any(Function),
        })
    })

    it('should call onChange when using onDelete and remove the correct value', () => {
        render(<Parameters {...props} />)
        getLastMockCall(ParameterMock)[0].onDelete(1)
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            props.value[0],
        ])
    })
})
