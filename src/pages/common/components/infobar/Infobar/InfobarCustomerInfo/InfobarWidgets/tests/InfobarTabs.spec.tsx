import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, List, Iterable} from 'immutable'

import {CUSTOM_WIDGET_TYPE} from 'state/widgets/constants'
import {IntegrationType} from 'models/integration/constants'
import {getWidgetName} from 'state/widgets/predicates'
import {WidgetType} from 'state/widgets/types'

import {InfobarTabs} from '../InfobarTabs'

const getWidgetNames = (
    preparedDisplayList: List<Iterable<string, Map<string, unknown>>>
) =>
    preparedDisplayList.map((item) => {
        const widget = item?.get('widget')
        const templatePath = item?.getIn(['template', 'path'])

        return getWidgetName({
            source: fromJS({doesnt: 'matter'}),
            widgetType: widget?.get('type') as WidgetType,
            widgetAppId: widget?.get('app_id') as string,
            templatePath,
        })
    }) as unknown as string[]

describe('<InfobarTabs/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const widgetNames = getWidgetNames(
                fromJS([
                    {widget: {type: IntegrationType.Http}},
                    {widget: {type: IntegrationType.Shopify}},
                    {widget: {type: IntegrationType.Magento2}},
                    {widget: {type: IntegrationType.SmoochInside}},
                    {widget: {type: CUSTOM_WIDGET_TYPE}},
                ])
            )

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should render without duplicates', () => {
            const widgetNames = getWidgetNames(
                fromJS([
                    {widget: {type: IntegrationType.Http}},
                    {widget: {type: IntegrationType.Http}},
                    {widget: {type: IntegrationType.Shopify}},
                ])
            )

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should not render when list is empty', () => {
            const widgetNames = getWidgetNames(fromJS([]))

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })

        it('should not render when list contains only one item', () => {
            const widgetNames = getWidgetNames(
                fromJS([{widget: {type: IntegrationType.Http}}])
            )

            const component = shallow(<InfobarTabs widgetNames={widgetNames} />)

            expect(component).toMatchSnapshot()
        })
    })
})
