import React, { ComponentProps } from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Modal from 'pages/common/components/modal/Modal'

import LinkPopover from '../LinkPopover'

jest.mock('hooks/useId', () => () => 1)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.spyOn(window, 'clearTimeout')

describe('<LinkPopover />', () => {
    let store = mockStore({})
    beforeEach(() => {
        store = mockStore({ ui: { editor: { isEditingLink: false } } })
    })

    const minProps = {
        url: 'http://gorgias.com',
    } as unknown as ComponentProps<typeof LinkPopover>

    it('should render a link', () => {
        const { baseElement } = render(
            <Provider store={store}>
                <LinkPopover {...minProps}>I am a link</LinkPopover>
            </Provider>,
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render a popover on link hover', () => {
        const label = 'hover me'
        const { getByText, queryByText } = render(
            <Provider store={store}>
                <LinkPopover {...minProps}>{label}</LinkPopover>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))
        expect(queryByText(minProps.url)).toBeTruthy()
    })

    it('should render a popover with edition action', () => {
        const label = 'hover me'
        const props = {
            onEdit: jest.fn(),
        }

        const { getByText } = render(
            <Provider store={store}>
                <LinkPopover {...minProps} {...props}>
                    {label}
                </LinkPopover>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.click(getByText('edit'))
        expect(props.onEdit).toHaveBeenCalledWith()
    })

    it('should render a popover with deletion action', () => {
        const label = 'hover me'
        const props = {
            onDelete: jest.fn(),
        }

        const { getByText } = render(
            <Provider store={store}>
                <LinkPopover {...minProps} {...props}>
                    {label}
                </LinkPopover>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.click(getByText('clear'))
        expect(props.onDelete).toHaveBeenCalledWith()
    })

    it('should render the popover on a specified modal', () => {
        const label = 'hover me'

        const { baseElement, getByText } = render(
            <Provider store={store}>
                <Modal isOpen onClose={_noop}>
                    <LinkPopover {...minProps}>{label}</LinkPopover>
                </Modal>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))

        expect(baseElement).toMatchSnapshot()
    })

    it('should hide the popover when hovering out of the link', async () => {
        const label = 'hover me'
        const { getByText, queryByText } = render(
            <Provider store={store}>
                <LinkPopover {...minProps}>{label}</LinkPopover>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.mouseLeave(getByText(label))
        await waitFor(() => expect(queryByText(minProps.url)).toBeFalsy())
    })

    it('should clear popover disappearance timeout on unmount', () => {
        const label = 'hover me'
        const { getByText, unmount } = render(
            <Provider store={store}>
                <LinkPopover {...minProps}>{label}</LinkPopover>
            </Provider>,
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.mouseLeave(getByText(label))
        unmount()

        expect(window.clearTimeout).toHaveBeenCalled()
    })
})
