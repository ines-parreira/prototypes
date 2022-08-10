import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import Modal from 'pages/common/components/modal/Modal'
import {LinkPopoverContainer} from '../LinkPopover'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.spyOn(window, 'clearTimeout')

describe('<LinkPopover />', () => {
    let store = mockStore({})
    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({isEditingLink: false})
    })

    const minProps = {
        id: 1,
        url: 'http://gorgias.com',
    } as unknown as ComponentProps<typeof LinkPopoverContainer>

    it('should render a link', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps}>
                    I am a link
                </LinkPopoverContainer>
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should render a popover on link hover', () => {
        const label = 'hover me'
        const {getByText, queryByText} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps}>
                    {label}
                </LinkPopoverContainer>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))
        expect(queryByText(minProps.url)).toBeTruthy()
    })

    it('should render a popover with edition action', () => {
        const label = 'hover me'
        const props = {
            onEdit: jest.fn(),
        }

        const {getByText} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps} {...props}>
                    {label}
                </LinkPopoverContainer>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.click(getByText('edit'))
        expect(props.onEdit).toHaveBeenCalledWith(minProps.id)
    })

    it('should render a popover with deletion action', () => {
        const label = 'hover me'
        const props = {
            onDelete: jest.fn(),
        }

        const {getByText} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps} {...props}>
                    {label}
                </LinkPopoverContainer>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.click(getByText('clear'))
        expect(props.onDelete).toHaveBeenCalledWith(minProps.id)
    })

    it('should render the popover on a specified modal', () => {
        const label = 'hover me'

        const {baseElement, getByText} = render(
            <Provider store={store}>
                <Modal isOpen onClose={_noop}>
                    <LinkPopoverContainer {...minProps}>
                        {label}
                    </LinkPopoverContainer>
                </Modal>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))

        expect(baseElement).toMatchSnapshot()
    })

    it('should hide the popover when hovering out of the link', async () => {
        const label = 'hover me'
        const {getByText, queryByText} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps}>
                    {label}
                </LinkPopoverContainer>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.mouseLeave(getByText(label))
        await waitFor(() => expect(queryByText(minProps.url)).toBeFalsy())
    })

    it('should clear popover disappearance timeout on unmount', () => {
        const label = 'hover me'
        const {getByText, unmount} = render(
            <Provider store={store}>
                <LinkPopoverContainer {...minProps}>
                    {label}
                </LinkPopoverContainer>
            </Provider>
        )

        fireEvent.mouseOver(getByText(label))
        fireEvent.mouseLeave(getByText(label))
        unmount()

        expect(window.clearTimeout).toHaveBeenCalled()
    })
})
