import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import SelectInputBox, {SelectInputBoxContext} from '../SelectInputBox'

describe('<SelectInputBox />', () => {
    const defaultProps: ComponentProps<typeof SelectInputBox> = {
        label: 'Foo',
        onToggle: jest.fn(),
        placeholder: 'bar',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a select input box', () => {
        const {container} = render(<SelectInputBox {...defaultProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a label array', () => {
        const label = ['foo', 'bar']
        const {getByText} = render(
            <SelectInputBox {...defaultProps} label={label} />
        )

        expect(getByText(label.join(', '))).toBeTruthy()
    })

    it('should render a placeholder when no value is passed', () => {
        const {getByText} = render(
            <SelectInputBox {...defaultProps} label={null} />
        )

        expect(getByText(defaultProps.placeholder!)).toBeTruthy()
    })

    it('should render a prefix and a suffix', () => {
        const {container} = render(
            <SelectInputBox {...defaultProps} prefix="prefix" suffix="suffix" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onToggle when the input has autofocus', () => {
        render(<SelectInputBox {...defaultProps} autoFocus />)

        expect(defaultProps.onToggle).toHaveBeenNthCalledWith(1, true)
    })

    it('should call onToggle when the focus status change', () => {
        const {getByText} = render(<SelectInputBox {...defaultProps} />)
        const inputElement = getByText(defaultProps.label as string)

        fireEvent.focus(inputElement)
        fireEvent.blur(inputElement)
        expect(defaultProps.onToggle).toHaveBeenNthCalledWith(1, true)
        expect(defaultProps.onToggle).toHaveBeenNthCalledWith(2, false)
    })

    it('should not call onToggle when the input is disabled', () => {
        const {getByText} = render(
            <SelectInputBox {...defaultProps} isDisabled />
        )
        const inputElement = getByText(defaultProps.label as string)

        fireEvent.focus(inputElement)
        expect(defaultProps.onToggle).not.toHaveBeenCalled()
    })

    it('should call onToggle when the input is focused and we press the escape key', () => {
        const {getByText} = render(<SelectInputBox {...defaultProps} />)
        const inputElement = getByText(defaultProps.label as string)

        fireEvent.focus(inputElement)
        fireEvent.keyDown(document.body, {
            key: 'Escape',
        })
        // FIXME: workaround for https://github.com/testing-library/user-event/issues/592
        fireEvent.blur(inputElement)
        expect(defaultProps.onToggle).toHaveBeenNthCalledWith(2, false)
    })

    it('should call onToggle when the component is blurred through context', () => {
        const {getByText} = render(
            <SelectInputBox {...defaultProps}>
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <div
                            onClick={() => {
                                context?.onBlur()
                            }}
                        >
                            click
                        </div>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        )

        fireEvent.focus(getByText(defaultProps.label as string))
        fireEvent.click(getByText(/click/))
        expect(defaultProps.onToggle).toHaveBeenNthCalledWith(2, false)
    })
})
