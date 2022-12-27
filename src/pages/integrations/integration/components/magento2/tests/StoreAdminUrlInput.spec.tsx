import React, {useState} from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {StoreAdminNewUrlInput} from '../StoreAdminNewUrlInput'

const WrapperComponent = ({onChange}: {onChange?: (value: string) => void}) => {
    const [value, setValue] = useState('')

    return (
        <StoreAdminNewUrlInput
            value={value}
            onChange={(newValue) => {
                onChange?.(newValue)
                setValue(newValue)
            }}
        />
    )
}
describe('<StoreAdminUrlInput />', () => {
    it('calls `onChange` with correct value', async () => {
        const onChangeMock = jest.fn()

        render(<WrapperComponent onChange={onChangeMock} />)

        await userEvent.type(
            screen.getByRole('textbox'),
            '   https://admin.hello.us.com/index.php   '
        )

        expect(onChangeMock).toHaveBeenCalledWith(
            'admin.hello.us.com/index.php'
        )

        userEvent.clear(screen.getByRole('textbox'))

        await userEvent.type(
            screen.getByRole('textbox'),
            '   http://some.site.com/index.php'
        )

        expect(onChangeMock).toHaveBeenLastCalledWith('some.site.com/index.php')
    })

    it.each([
        // `true` means there's pattern mismatch - incorrect input
        // `false` means there's no patterns mismatch - correct input
        ['someincorrectstring', true],
        ['no.admin.com', true],
        ['admin.hello.us.com/index.php', false],
        ['admin.hello.us/index.php', false],
        ['admin.hello.us/hidden_admin', false],
        ['admin.hello.us:31337/hidden_admin', false],
        ['admin.hello.us:31337/index.php', false],
    ])(
        'should validate input field with input of "%s"',
        async (input, result) => {
            render(<WrapperComponent />)

            await userEvent.type(screen.getByRole('textbox'), input)

            expect(
                (screen.getByRole('textbox') as HTMLInputElement).validity
                    .patternMismatch
            ).toBe(result)
        }
    )
})
