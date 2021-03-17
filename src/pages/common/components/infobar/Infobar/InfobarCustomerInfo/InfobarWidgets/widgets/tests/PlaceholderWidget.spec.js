import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {PlaceholderWidgetContainer} from '../PlaceholderWidget.tsx'

describe('PlaceholderWidget component', () => {
    const integrationId = 1
    const minProps = {
        template: fromJS({
            path: ['ticket', 'customer', 'integrations', integrationId],
            templatePath: '0.template',
        }),
        widget: fromJS({
            type: 'shopify',
        }),
        editing: {
            actions: {
                foo: () => {},
                removeEditedWidget: () => {},
            },
        },
        integration: null,
    }

    it('should display the integration type if the widget is not for an HTTP integration', () => {
        const component = shallow(<PlaceholderWidgetContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display the integration name if the widget is for an HTTP integration', () => {
        const widget = minProps.widget
            .set('type', 'http')
            .set('integration_id', integrationId)

        const component = shallow(
            <PlaceholderWidgetContainer
                {...minProps}
                widget={widget}
                integration={fromJS({
                    id: integrationId,
                    type: 'http',
                    name: 'my little integration http',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
