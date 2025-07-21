import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ParameterTypes } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

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
        render(<Parameter {...{ ...props, index: 1 }} />)

        expect(screen.queryAllByLabelText(/.+/)).toHaveLength(0)
    })

    it('should call onChange when changing type', async () => {
        const user = userEvent.setup()
        render(<Parameter {...props} />)
        await act(() => user.click(screen.getByLabelText('Type')))
        await act(() =>
            user.click(screen.getByRole('menuitem', { name: /Dropdown/ })),
        )

        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[${props.index}].type`,
            ParameterTypes.Dropdown,
        )
    })

    describe('Text parameter', () => {
        it.each(['label', 'key', 'value'])(
            'should call onChange when changing %s',
            async (field) => {
                const user = userEvent.setup()
                render(<Parameter {...props} />)
                const newValue = 'newValue'
                await act(async () => {
                    const input = screen.getByLabelText(new RegExp(field, 'i'))
                    await user.clear(input)
                    await user.type(input, newValue)
                })

                expect(props.debouncedOnChange).toHaveBeenCalledWith(
                    `${props.path}[${props.index}].${field}`,
                    newValue,
                )
            },
        )

        it('should enable the required checkbox conditionally and call onChange when clicking it', async () => {
            const user = userEvent.setup()
            const { rerender } = render(<Parameter {...props} />)
            expect(screen.getByLabelText('Required')).toHaveAttribute(
                'disabled',
            )

            rerender(
                <Parameter
                    {...{
                        ...props,
                        parameter: { ...props.parameter, editable: true },
                    }}
                />,
            )

            expect(screen.getByLabelText('Required')).not.toHaveAttribute(
                'disabled',
            )

            await act(() => user.click(screen.getByLabelText('Required')))

            expect(props.onChange).toHaveBeenCalledWith(
                `${props.path}[${props.index}].mandatory`,
                true,
            )
        })
    })

    describe('Dropdown parameter', () => {
        it.each(['label', 'key', 'value'])(
            'should call onChange when changing %s',
            async (field) => {
                const user = userEvent.setup()
                render(<Parameter {...props} />)
                const newValue = 'newValue'
                await act(async () => {
                    const input = screen.getByLabelText(new RegExp(field, 'i'))
                    await user.clear(input)
                    await user.type(input, newValue)
                })

                expect(props.debouncedOnChange).toHaveBeenCalledWith(
                    `${props.path}[${props.index}].${field}`,
                    newValue,
                )
            },
        )

        it('should disable the editable checkbox and call onChange when clicking required checkbox', async () => {
            const user = userEvent.setup()
            render(
                <Parameter
                    {...{
                        ...props,
                        parameter: {
                            ...props.parameter,
                            type: ParameterTypes.Dropdown,
                        },
                    }}
                />,
            )
            expect(screen.getByLabelText('Editable')).toHaveAttribute(
                'disabled',
            )

            await act(() => user.click(screen.getByLabelText('Required')))

            expect(props.onChange).toHaveBeenCalledWith(
                `${props.path}[${props.index}].mandatory`,
                true,
            )
        })
    })

    it('should call onChange when clicking editable', async () => {
        const user = userEvent.setup()
        render(<Parameter {...props} />)
        await act(() => user.click(screen.getByLabelText('Editable')))
        expect(props.onChange).toHaveBeenCalledWith(
            `${props.path}[${props.index}].editable`,
            true,
        )
    })

    it('should call onDelete when removing param', async () => {
        const user = userEvent.setup()
        render(<Parameter {...props} />)
        await act(() =>
            user.click(screen.getByRole('button', { name: 'close' })),
        )
        expect(props.onDelete).toHaveBeenCalledWith(props.index)
    })
})
