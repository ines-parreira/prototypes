// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    EVENTS,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import {shopifyDraftOrderPayloadFixture} from '../../../../../../../../../../../../../fixtures/shopify'
import {DuplicateOrderFooterComponent} from '../OrderFooter'
import {ShopifyAction} from '../../../../constants'

jest.mock('lodash/debounce', () => (fn) => fn)

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        return {
            ...jest.requireActual(
                '../../../../../../../../../../../../../store/middlewares/segmentTracker'
            ),
            logEvent: jest.fn(),
        }
    }
)

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
                    actionName={ShopifyAction.DUPLICATE_ORDER}
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
                    actionName={ShopifyAction.DUPLICATE_ORDER}
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
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_NOTES_CHANGED,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_NOTES_CHANGED,
            ],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName, event) => {
                const payload = fromJS(shopifyDraftOrderPayloadFixture())

                const component = shallow(
                    <DuplicateOrderFooterComponent
                        editable
                        actionName={actionName}
                        currencyCode="USD"
                        payload={payload}
                        onPayloadChange={onPayloadChange}
                    />,
                    {context}
                )

                component.find('textarea').simulate('change', {
                    target: {
                        value: 'new note',
                        style: {},
                        scrollHeight: 20,
                    },
                })

                expect(onPayloadChange).toHaveBeenCalledWith(
                    context.integrationId,
                    payload.set('note', 'new note')
                )

                expect(logEvent).toHaveBeenCalledWith(event)
            }
        )
    })

    describe('_onTagsChange()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_TAGS_CHANGED,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_TAGS_CHANGED,
            ],
        ])(
            'should call onPayloadChange() with updated payload',
            (actionName, event) => {
                const payload = fromJS(shopifyDraftOrderPayloadFixture())

                const component = shallow(
                    <DuplicateOrderFooterComponent
                        editable
                        actionName={actionName}
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
                    payload.set('tags', 'new tag 1,new tag 2')
                )

                expect(logEvent).toHaveBeenCalledWith(event)
            }
        )
    })
})
