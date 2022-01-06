import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {renderWithRouter} from '../../../../utils/testing'
import {TicketInfobarContainer} from '../TicketInfobarContainer'
import Infobar from '../../../common/components/infobar/Infobar/Infobar'

jest.addMatchers(immutableMatchers)
jest.mock('../../../common/components/infobar/Infobar/Infobar', () => {
    return ({customer, sources, widgets}: ComponentProps<typeof Infobar>) => {
        return (
            <div>
                Infobar mock
                <div>customer: {JSON.stringify(customer.toJS())}</div>
                <div>sources: {JSON.stringify(sources.toJS())}</div>
                <div>widgets: {JSON.stringify(widgets.toJS())}</div>
            </div>
        )
    }
})

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
                updateCustomActions: jest.fn(),
                fetchWidgets: jest.fn(),
                selectContext: jest.fn(),
            },
            fetchPreviewCustomer: jest.fn(),
        },
        ticket: fromJS({}),
        widgets: fromJS({}),
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
    }

    it('should render infobar for new ticket', () => {
        const {container} = renderWithRouter(
            <TicketInfobarContainer {...minProps} />,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should disable widget editing new tickets without customer', () => {
        const {container} = renderWithRouter(
            <TicketInfobarContainer {...minProps} />,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow widget editing new tickets with customer', () => {
        const sources = fromJS({
            ticket: fromJS({
                customer: {name: 'Pizza Pepperoni'},
            }),
            customer: fromJS({}),
        })
        const {container} = renderWithRouter(
            <TicketInfobarContainer {...minProps} sources={sources} />,
            {
                path: '/foo/:ticketId?',
                route: '/foo/new',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
