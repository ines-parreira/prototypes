// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {shopifyDraftOrderPayloadFixture} from '../../../../../../../../../../../../../fixtures/shopify'
import {DuplicateOrderFooterComponent} from '../OrderFooter'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<DuplicateOrderFooterComponent/>', () => {
    const context = {integrationId: 1}
    let onPayloadChange

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    currencyCode="USD"
                    payload={fromJS(shopifyDraftOrderPayloadFixture())}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with tags', () => {
            const payload = shopifyDraftOrderPayloadFixture()
            payload.tags = 'tag1,tag2,tag3'

            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    currencyCode="USD"
                    payload={fromJS(payload)}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onNoteChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    currencyCode="USD"
                    payload={payload}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.find('textarea').simulate('change', {target: {value: 'new note', style: {}, scrollHeight: 20}})

            expect(onPayloadChange).toHaveBeenCalledWith(
                context.integrationId,
                payload.set('note', 'new note'),
            )
        })
    })

    describe('_onTagsChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            const component = shallow(
                <DuplicateOrderFooterComponent
                    editable
                    currencyCode="USD"
                    payload={payload}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.instance()._onTagsChange([
                {label: 'new tag 1', value: 'new tag 1'},
                {label: 'new tag 2', value: 'new tag 2'},
            ])

            expect(onPayloadChange).toHaveBeenCalledWith(
                context.integrationId,
                payload.set('tags', 'new tag 1,new tag 2'),
            )
        })
    })
})
