import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {TicketInfobarContainer} from '../TicketInfobarContainer'

jest.addMatchers(immutableMatchers)

describe('TicketInfobarContainer component', () => {
    const minProps = {
        actions: {
            widgets: {
                cancelDrag: jest.fn(),
                drag: jest.fn(),
                drop: jest.fn(),
                generateAndSetWidgets: jest.fn(),
                removeEditedWidget: jest.fn(),
                resetWidgets: jest.fn(),
                setEditedWidgets: jest.fn(),
                setEditionAsDirty: jest.fn(),
                startEditionMode: jest.fn(),
                startWidgetEdition: jest.fn(),
                stopEditionMode: jest.fn(),
                stopWidgetEdition: jest.fn(),
                submitWidgets: jest.fn(),
                updateEditedWidget: jest.fn(),
                fetchWidgets: jest.fn(),
                selectContext: jest.fn(),
            },
            fetchPreviewCustomer: jest.fn(),
        },
        infobar: fromJS({}),
        ticket: fromJS({}),
        widgets: fromJS({}),
        match: {
            params: {
                ticketId: 'new',
            },
        },
        location: {
            search: '',
        },
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
    }

    it('should render infobar for new ticket', () => {
        const component = shallow(<TicketInfobarContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should disable widget editing new tickets without customer', () => {
        const component = shallow(<TicketInfobarContainer {...minProps} />)

        expect(component.prop('customer')).toEqualImmutable(fromJS({}))
    })

    it('should allow widget editing new tickets with customer', () => {
        const sources = fromJS({
            ticket: fromJS({
                customer: {name: 'Pizza Pepperoni'},
            }),
            customer: fromJS({}),
        })
        const component = shallow(
            <TicketInfobarContainer {...minProps} sources={sources} />
        )

        expect(component.prop('customer')).toEqualImmutable(
            sources.getIn(['ticket', 'customer'])
        )
    })
})
