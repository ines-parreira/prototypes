import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import * as widgetsFixtures from '../../../../../../../../../fixtures/widgets'
import * as ticketFixtures from '../../../../../../../../../fixtures/ticket.ts'

import ListInfobarWidget from '../ListInfobar'

describe('Infobar::Widgets::ListInfobarWidget', () => {
    const source = fromJS(
        ticketFixtures.ticket.customer.integrations['5'].orders
    )
    const widget = fromJS(widgetsFixtures.shopifyWidget)
    const template = widget
        .getIn(['template', 'widgets', 1])
        .set('templatePath', '0.template.widgets.1')
        .set('absolutePath', [
            'ticket',
            'customer',
            'integrations',
            '5',
            'orders',
        ])

    const minProps = {
        isEditing: false,
        isParentList: false,
        open: false,
        source,
        widget,
        template,
    }

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
            expect(component.find('.footer').exists()).toBe(false)
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
            expect(component.find('.footer').exists()).toBe(true)
        })
    })
})
