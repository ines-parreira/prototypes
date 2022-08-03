import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import mockDate from 'mockdate'
import React from 'react'
import {
    addInternalNoteAction,
    addTagsAction,
    httpAction,
    shopifyAction,
} from 'fixtures/macro'
import TMPApplyOnSendPopover from '../ApplyOnSendPopover'

jest.spyOn(window.localStorage.__proto__, 'setItem')

mockDate.set(new Date('2022-08-01'))

describe('<ApplyOnSendPopover/>', () => {
    const minProps = {
        actions: fromJS([addTagsAction]),
    }

    const element = document.createElement('div')
    element.setAttribute('id', 'submit-button')
    document.body.appendChild(element)

    it('should render the popover', () => {
        render(<TMPApplyOnSendPopover {...minProps} />)
        expect(document.body).toMatchSnapshot()
    })

    it.each([
        [fromJS([])],
        [fromJS([httpAction, shopifyAction, addInternalNoteAction])],
    ])('should not render the popover', (actions) => {
        render(<TMPApplyOnSendPopover actions={actions} />)
        expect(document.body.childElementCount).toBe(2)
    })

    it('should not render after click', () => {
        const {rerender} = render(<TMPApplyOnSendPopover {...minProps} />)
        fireEvent.click(screen.getByText('Got It'))
        expect(localStorage.setItem).toHaveBeenCalled()

        const spy = jest.spyOn(window.localStorage.__proto__, 'getItem')
        spy.mockImplementation(() => 1)
        rerender(<TMPApplyOnSendPopover {...minProps} key={1} />) // Force re-render
        expect(document.body.childElementCount).toBe(2)

        spy.mockImplementation(() => 0)
    })

    it('should not render the popover because of date', () => {
        mockDate.set(new Date('2022-09-16'))

        render(<TMPApplyOnSendPopover {...minProps} />)
        expect(document.body).toMatchSnapshot()
    })
})
