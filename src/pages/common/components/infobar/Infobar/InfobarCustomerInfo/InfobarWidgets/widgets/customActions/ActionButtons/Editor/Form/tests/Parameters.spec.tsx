import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import Parameters from '../Parameters'

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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call onChange when adding a new parameter', () => {
        render(<Parameters {...{...props, value: []}} />)

        fireEvent.click(
            screen.getByRole('button', {
                name: 'add',
            })
        )
        expect(props.onChange).toHaveBeenCalledWith(props.path, [
            {key: '', value: '', label: '', editable: false, mandatory: false},
        ])
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
        fireEvent.click(screen.getByRole('button', {name: 'edit'}))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[0].editable`,
            true
        )
    })

    it('should render the mandatory button conditionnally and call onChange when clicking it', () => {
        const {rerender} = render(<Parameters {...props} />)
        expect(
            screen
                .getByRole('button', {name: 'mandatory'})
                .getAttribute('disabled')
        ).toBeDefined()
        rerender(
            <Parameters
                {...{...props, value: [{...props.value[0], editable: true}]}}
            />
        )
        expect(
            screen
                .getByRole('button', {name: 'mandatory'})
                .getAttribute('disabled')
        ).toBeFalsy()
        fireEvent.click(screen.getByRole('button', {name: 'mandatory'}))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[0].mandatory`,
            true
        )
    })

    it('should call onChange when removing param', () => {
        render(<Parameters {...props} />)
        fireEvent.click(screen.getByRole('button', {name: 'delete'}))
        expect(props.onChange).toHaveBeenCalledWith(props.path, [])
    })
})
