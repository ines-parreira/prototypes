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
} from 'state/widgets/constants.ts'

import {getWidgetName} from 'state/widgets/predicates.ts'

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
            const widgetNames = preparedDisplayList.map((item) => {
                const widget = item.get('widget')
                const templatePath = item.getIn(['template', 'path'])

                return getWidgetName({
                    source: fromJS({doesnt: 'matter'}),
                    widgetType: widget.get('type'),
                    widgetAppId: widget.get('app_id'),
                    templatePath,
                })
            })

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should render without duplicates', () => {
            const preparedDisplayList = fromJS([
                {widget: {type: HTTP_WIDGET_TYPE}},
                {widget: {type: HTTP_WIDGET_TYPE}},
                {widget: {type: SHOPIFY_WIDGET_TYPE}},
            ])
            const widgetNames = preparedDisplayList.map((item) => {
                const widget = item.get('widget')
                const templatePath = item.getIn(['template', 'path'])

                return getWidgetName({
                    source: fromJS({doesnt: 'matter'}),
                    widgetType: widget.get('type'),
                    widgetAppId: widget.get('app_id'),
                    templatePath,
                })
            })

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should not render when list is empty', () => {
            const preparedDisplayList = fromJS([])
            const widgetNames = preparedDisplayList.map((item) => {
                const widget = item.get('widget')
                const templatePath = item.getIn(['template', 'path'])

                return getWidgetName({
                    source: fromJS({doesnt: 'matter'}),
                    widgetType: widget.get('type'),
                    widgetAppId: widget.get('app_id'),
                    templatePath,
                })
            })

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should not render when list contains only one item', () => {
            const preparedDisplayList = fromJS([
                {widget: {type: HTTP_WIDGET_TYPE}},
            ])
            const widgetNames = preparedDisplayList.map((item) => {
                const widget = item.get('widget')
                const templatePath = item.getIn(['template', 'path'])

                return getWidgetName({
                    source: fromJS({doesnt: 'matter'}),
                    widgetType: widget.get('type'),
                    widgetAppId: widget.get('app_id'),
                    templatePath,
                })
            })

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })
    })
})
