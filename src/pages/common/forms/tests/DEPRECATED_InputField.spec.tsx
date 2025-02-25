import React, { ComponentProps } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'

describe('DEPRECATED_InputField', () => {
    const minProps: ComponentProps<typeof DEPRECATED_InputField> = {
        value: 'value',
        onChange: _noop,
    }

    it('should use default props', () => {
        const { container } = render(<DEPRECATED_InputField {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a basic text input', () => {
        const { container } = render(
            <DEPRECATED_InputField
                {...minProps}
                type="text"
                label="label"
                placeholder="placeholder"
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required text input', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} required />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an inline text input', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} inline />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a help text', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} help="help text" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a tooltip next to the label', () => {
        const { container } = render(
            <DEPRECATED_InputField
                {...minProps}
                label="Label"
                tooltip="I am a tooltip"
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an inline required text input', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} required inline />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a text input with a right addon', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} rightAddon="@rightaddon.io" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a text input with an onChange handler, and call this handler on change', async () => {
        const valueStorage = ''
        const newValue = 'newValue'
        const onChangeSpy = jest.fn()

        const { container } = render(
            <DEPRECATED_InputField
                {...minProps}
                value={valueStorage}
                onChange={onChangeSpy}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
        const input = screen.getByRole('textbox')
        userEvent.paste(input, newValue)

        await waitFor(() => {
            expect(onChangeSpy).toHaveBeenCalledWith(newValue)
        })
    })

    it('should render a number input with an onChange handler, and call this handler on change', () => {
        const onChangeSpy = jest.fn()

        const { container } = render(
            <DEPRECATED_InputField
                {...minProps}
                type="number"
                value="value"
                onChange={onChangeSpy}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()

        const newValue = '12'
        const input = screen.getByRole('spinbutton')
        userEvent.paste(input, newValue)

        expect(onChangeSpy).toHaveBeenCalledWith(parseFloat(newValue))
    })

    it('should render a hidden text input', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} hidden />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a text input with a suffix', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} suffix="px" />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the input with an error', () => {
        const { container } = render(
            <DEPRECATED_InputField {...minProps} error="the value is wrong" />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a lowercase value and convert any uppercase input to lowercase', () => {
        const valueStorage = ''
        const onChangeSpy = jest.fn()

        const { container } = render(
            <DEPRECATED_InputField
                {...minProps}
                value={valueStorage}
                onChange={onChangeSpy}
                caseInsensitive
            />,
        )
        expect(container.firstChild).toMatchSnapshot()

        const newValue = 'newValue'
        const input = screen.getByRole('textbox')
        userEvent.paste(input, newValue)

        expect(onChangeSpy).toHaveBeenCalledWith(newValue.toLowerCase())
    })
})
