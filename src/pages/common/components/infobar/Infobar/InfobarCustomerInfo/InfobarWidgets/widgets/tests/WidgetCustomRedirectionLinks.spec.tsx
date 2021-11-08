import React from 'react'

import {shallow} from 'enzyme'
import {fromJS, List, Map} from 'immutable'

import * as widgetsFixtures from '../../../../../../../../../fixtures/widgets'
import WidgetCustomRedirectionLinks from '../WidgetCustomRedirectionLinks'

describe('<WidgetCustomRedirectionLinks/>', () => {
    let widget = fromJS(widgetsFixtures.shopifyWidget) as Map<any, any>
    const maxVisibleLinks = 3

    let template = widget.getIn(['template', 'widgets', 1]) as Map<any, any>
    template = template
        .set('templatePath', '0.template.widgets.1')
        .set('absolutePath', [
            'ticket',
            'customer',
            'integrations',
            '5',
            'orders',
        ])

    function _getLinks(NumberOfLinks: number) {
        const links = []

        for (let i = 0; i < NumberOfLinks; i++) {
            links.push(
                fromJS({
                    url: 'https://www.gorgias.com',
                    name: 'Gorgias',
                })
            )
        }

        return List(links)
    }

    describe('render()', () => {
        it.each([
            ['an empty component (not links, no button, no popover)', false],
            [
                'an `Add Redirection Link` Button and the Link editor popover',
                true,
            ],
        ])('should render %s', (_, isEditing) => {
            const component = shallow(
                <WidgetCustomRedirectionLinks
                    widget={widget}
                    template={template}
                    isEditing={isEditing}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it.each([
            [
                'all the links without the `Add Redirection Link` button and without a `SHOW MORE` link (isEditing=false)',
                [maxVisibleLinks, false],
            ],
            [
                'some links and a `SHOW MORE` link but without an `Add Redirection Link` button (isEditing=false)',
                [maxVisibleLinks + 1, false],
            ],
            [
                'all the links with the `Add Redirection Link` button and without a `SHOW MORE` link (isEditing=true)',
                [maxVisibleLinks, true],
            ],
            [
                'all the links with the `Add Redirection Link` button and without a `SHOW MORE` link (isEditing=true)',
                [maxVisibleLinks + 1, true],
            ],
        ])('should render %s', (_, [NumberOfLinks, isEditing]) => {
            widget = widget.setIn(
                ['template', 'widgets', 0, 'meta', 'custom', 'links'],
                _getLinks(Number(NumberOfLinks))
            )

            const component = shallow(
                <WidgetCustomRedirectionLinks
                    widget={widget}
                    template={template}
                    isEditing={Boolean(isEditing)}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
