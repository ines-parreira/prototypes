import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Placeholder} from '../Placeholder'

describe('PlaceholderWidget component', () => {
    const integrationId = 1
    const minProps: ComponentProps<typeof Placeholder> = {
        source: fromJS({}),
        template: fromJS({
            path: ['ticket', 'customer', 'integrations', integrationId],
            templatePath: '0.template',
        }),
        widget: fromJS({
            type: 'shopify',
        }),
        integration: null,
        dispatch: jest.fn(),
    }

    it('should display the integration type if the widget is not for an HTTP integration', () => {
        const {container} = render(<Placeholder {...minProps} />)

        expect(container).toMatchSnapshot()
    })

    it('should display the integration name if the widget is for an HTTP integration', () => {
        const widget = minProps.widget
            .set('type', 'http')
            .set('integration_id', integrationId)

        const {container} = render(
            <Placeholder
                {...minProps}
                widget={widget}
                integration={fromJS({
                    id: integrationId,
                    type: 'http',
                    name: 'my little integration http',
                })}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
