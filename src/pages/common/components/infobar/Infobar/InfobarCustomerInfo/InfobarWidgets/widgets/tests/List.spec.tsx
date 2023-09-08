import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map, List} from 'immutable'

import * as widgetsFixtures from 'fixtures/widgets'
import * as ticketFixtures from 'fixtures/ticket'

import ListInfobarWidget from '../List'

describe('Infobar::Widgets::List', () => {
    const source = fromJS(
        (
            ticketFixtures.ticket.customer!.integrations as Record<
                string,
                {orders: unknown}
            >
        )['5'].orders
    ) as List<Map<string, unknown>>

    const widget = fromJS(widgetsFixtures.shopifyWidget) as Map<string, unknown>
    const template = (
        widget.getIn(['template', 'widgets', 1]) as Map<string, unknown>
    )
        .set('templatePath', '0.template.widgets.1')
        .set('absolutePath', [
            'ticket',
            'customer',
            'integrations',
            '5',
            'orders',
        ])

    const minProps: ComponentProps<typeof ListInfobarWidget> = {
        isEditing: false,
        isParentList: false,
        source,
        widget,
        template,
    }

    it('should not render if list template has no widget inside', () => {
        const component = shallow(
            <ListInfobarWidget
                {...{...minProps, template: template.set('widgets', [])}}
            />
        )
        expect(component.isEmptyRender()).toBe(true)
    })

    it('used fixtures are correct', () => {
        expect(minProps.source.size).toBe(2)
        expect(template.getIn(['meta', 'limit'])).toBe('2')
    })

    describe('do not display show more button', () => {
        it('higher limit config than source size', () => {
            const component = shallow(<ListInfobarWidget {...minProps} />)
            expect(component.find('.footer').exists()).toBe(false)
        })

        it('no limit config', () => {
            const component = shallow(
                <ListInfobarWidget
                    {...minProps}
                    template={template.removeIn(['meta', 'limit'])}
                />
            )
            expect(component.find('button').exists()).toBe(false)
        })
    })

    describe('display show more button', () => {
        it('shorter limit config than source size', () => {
            const component = shallow(
                <ListInfobarWidget
                    {...minProps}
                    template={template.setIn(['meta', 'limit'], 1)}
                />
            )
            expect(component.find('button').exists()).toBe(true)
        })
    })
})
