import React from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'

import AccordionItemContext from 'pages/common/components/accordion/AccordionItemContext'

import {usePropagateError} from '../../QuickResponsesViewContext'
import QuickResponseTitle from '../QuickResponseTitle'

jest.mock('../../QuickResponsesViewContext')

describe('<QuickResponseTitle />', () => {
    it('should render the title component', () => {
        const {container} = render(
            <QuickResponseTitle
                title="How do I choose the right size?"
                onChange={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should focus the title if expanded', () => {
        const title = 'How do I choose the right size?'

        render(
            <AccordionItemContext.Provider
                value={{
                    isExpanded: true,
                    isDisabled: false,
                    toggleItem: jest.fn(),
                }}
            >
                <QuickResponseTitle title={title} onChange={jest.fn()} />
            </AccordionItemContext.Provider>
        )

        expect(screen.getByDisplayValue(title)).toHaveFocus()
    })

    it('should display error state & propagate error if title is too long', () => {
        const title = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

        render(<QuickResponseTitle title={title} onChange={jest.fn()} />)

        expect(screen.getByDisplayValue(title).parentElement!).toHaveClass(
            'hasError'
        )
        expect(usePropagateError).toBeCalledWith('title', true)
    })

    it('should call onChange handler if item is expanded', () => {
        const title = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        const onChangeMock = jest.fn()

        render(
            <AccordionItemContext.Provider
                value={{
                    isExpanded: true,
                    isDisabled: false,
                    toggleItem: jest.fn(),
                }}
            >
                <QuickResponseTitle title={title} onChange={onChangeMock} />
            </AccordionItemContext.Provider>
        )

        const input = screen.getByDisplayValue(title)

        act(() => {
            fireEvent.change(input, {target: {value: ''}})
        })

        expect(onChangeMock).toBeCalledWith('')
    })

    it('should not call onChange handler if item is not expanded', () => {
        const title = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        const onChangeMock = jest.fn()

        render(<QuickResponseTitle title={title} onChange={onChangeMock} />)

        const input = screen.getByDisplayValue(title)

        act(() => {
            fireEvent.change(input, {target: {value: ''}})
        })

        expect(onChangeMock).not.toBeCalled()
    })
})
