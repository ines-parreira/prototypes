import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {ParameterTypes} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import Parameter from '../Parameter'

describe('<Parameter/>', () => {
    const props = {
        onChange: jest.fn(),
        debouncedOnChange: jest.fn(),
        onDelete: jest.fn(),
        path: 'path',
        parameter: {
            type: ParameterTypes.Text,
            key: 'key',
            value: 'value',
            label: 'label',
            editable: false,
            mandatory: false,
        },
        index: 0,
    }

    it('should not display any label if index is not 0', () => {
        render(<Parameter {...{...props, index: 1}} />)

        expect(screen.queryAllByLabelText(/.+/)).toHaveLength(0)
    })

    it('should call onChange when changing type', () => {
        render(<Parameter {...props} />)
        fireEvent.click(screen.getByLabelText('Type'))
        fireEvent.click(screen.getByRole('menuitem', {name: /Dropdown/}))

        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[${props.index}].type`,
            ParameterTypes.Dropdown
        )
    })

    describe('Text parameter', () => {
        it.each(['label', 'key', 'value'])(
            'should call onChange when changing %s',
            (field) => {
                render(<Parameter {...props} />)
                const newValue = 'newValue'
                fireEvent.change(
                    screen.getByLabelText(new RegExp(field, 'i')),
                    {
                        target: {value: newValue},
                    }
                )
                expect(props.debouncedOnChange).toHaveBeenCalledWith(
                    `${props.path}[${props.index}].${field}`,
                    newValue
                )
            }
        )

        it('should enable the required checkbox conditionally and call onChange when clicking it', () => {
            const {rerender} = render(<Parameter {...props} />)
            expect(screen.getByLabelText('Required')).toHaveAttribute(
                'disabled'
            )

            rerender(
                <Parameter
                    {...{
                        ...props,
                        parameter: {...props.parameter, editable: true},
                    }}
                />
            )

            expect(screen.getByLabelText('Required')).not.toHaveAttribute(
                'disabled'
            )

            fireEvent.click(screen.getByLabelText('Required'))

            expect(props.onChange).toHaveBeenCalledWith(
                `${props.path}[${props.index}].mandatory`,
                true
            )
        })
    })

    describe('Dropdown parameter', () => {
        it.each(['label', 'key', 'value'])(
            'should call onChange when changing %s',
            (field) => {
                render(<Parameter {...props} />)
                const newValue = 'newValue'
                fireEvent.change(
                    screen.getByLabelText(new RegExp(field, 'i')),
                    {
                        target: {value: newValue},
                    }
                )
                expect(props.debouncedOnChange).toHaveBeenCalledWith(
                    `${props.path}[${props.index}].${field}`,
                    newValue
                )
            }
        )

        it('should disable the editable checkbox and call onChange when clicking required checkbox', () => {
            render(
                <Parameter
                    {...{
                        ...props,
                        parameter: {
                            ...props.parameter,
                            type: ParameterTypes.Dropdown,
                        },
                    }}
                />
            )
            expect(screen.getByLabelText('Editable')).toHaveAttribute(
                'disabled'
            )

            fireEvent.click(screen.getByLabelText('Required'))

            expect(props.onChange).toHaveBeenCalledWith(
                `${props.path}[${props.index}].mandatory`,
                true
            )
        })
    })

    it('should call onChange when clicking editable', () => {
        render(<Parameter {...props} />)
        fireEvent.click(screen.getByLabelText('Editable'))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[${props.index}].editable`,
            true
        )
    })

    it('should call onDelete when removing param', () => {
        render(<Parameter {...props} />)
        fireEvent.click(screen.getByRole('button', {name: 'close'}))
        expect(props.onDelete).toHaveBeenCalledWith(props.index)
    })
})
