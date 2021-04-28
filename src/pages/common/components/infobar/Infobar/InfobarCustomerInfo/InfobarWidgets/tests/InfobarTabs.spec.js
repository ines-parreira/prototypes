import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {InfobarTabs} from '../InfobarTabs.tsx'
import {
    CUSTOM_WIDGET_TYPE,
    HTTP_WIDGET_TYPE,
    MAGENTO2_WIDGET_TYPE,
    SHOPIFY_WIDGET_TYPE,
    SMOOCH_INSIDE_WIDGET_TYPE,
} from '../../../../../../../../state/widgets/constants'

describe('<InfobarTabs/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const preparedDisplayList = fromJS([
                {widget: {type: HTTP_WIDGET_TYPE}},
                {widget: {type: SHOPIFY_WIDGET_TYPE}},
                {widget: {type: MAGENTO2_WIDGET_TYPE}},
                {widget: {type: SMOOCH_INSIDE_WIDGET_TYPE}},
                {widget: {type: CUSTOM_WIDGET_TYPE}},
            ])

            const component = shallow(
                <InfobarTabs preparedDisplayList={preparedDisplayList} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without duplicates', () => {
            const preparedDisplayList = fromJS([
                {widget: {type: HTTP_WIDGET_TYPE}},
                {widget: {type: HTTP_WIDGET_TYPE}},
                {widget: {type: SHOPIFY_WIDGET_TYPE}},
            ])

            const component = shallow(
                <InfobarTabs preparedDisplayList={preparedDisplayList} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render when list is empty', () => {
            const preparedDisplayList = fromJS([])

            const component = shallow(
                <InfobarTabs preparedDisplayList={preparedDisplayList} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not render when list contains only one item', () => {
            const preparedDisplayList = fromJS([
                {widget: {type: HTTP_WIDGET_TYPE}},
            ])

            const component = shallow(
                <InfobarTabs preparedDisplayList={preparedDisplayList} />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
