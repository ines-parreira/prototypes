import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { shopifyWidget } from 'fixtures/widgets'

import type SourceWrapper from '../../../common/components/sourceWidgets/SourceWrapper'
import { CustomerSourceContainer } from '../CustomerSourceContainer'

jest.mock(
    '../../../common/components/sourceWidgets/SourceWrapper',
    () =>
        ({ context, identifier }: ComponentProps<typeof SourceWrapper>) => (
            <div>
                SourceWrapper
                <div>context: {context}</div>
                <div>identifier: {identifier}</div>
            </div>
        ),
)

describe('<CustomerSourceContainer />', () => {
    const minProps = {
        actions: {
            customers: {
                bulkDeleteCustomer: jest.fn(),
                deleteCustomer: jest.fn(),
                fetchCustomer: jest.fn(),
                fetchCustomerHistory: jest.fn(),
                mergeCustomers: jest.fn(),
                submitCustomer: jest.fn(),
            },
            widgets: {
                cancelDrag: jest.fn(),
                drag: jest.fn(),
                drop: jest.fn(),
                fetchWidgets: jest.fn(),
                generateAndSetWidgets: jest.fn(),
                removeEditedWidget: jest.fn(),
                resetWidgets: jest.fn(),
                selectContext: jest.fn(),
                setEditedWidgets: jest.fn(),
                setEditionAsDirty: jest.fn(),
                startEditionMode: jest.fn(),
                startWidgetEdition: jest.fn(),
                stopEditionMode: jest.fn(),
                stopWidgetEdition: jest.fn(),
                submitWidgets: jest.fn(),
                updateEditedWidget: jest.fn(),
            },
        },
        activeCustomerId: 1,
        sources: fromJS({
            ticket: fromJS({}),
            customer: fromJS({}),
        }),
        widgets: fromJS([shopifyWidget]),
    } as unknown as ComponentProps<typeof CustomerSourceContainer>

    it('should display content when a customer id is provided', () => {
        const { container } = render(
            <CustomerSourceContainer {...minProps} />,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch customer with the provided parameter', () => {
        render(<CustomerSourceContainer {...minProps} />, {
            path: '/foo/:customerId?',
            initialEntries: ['/foo/1'],
        })

        expect(minProps.actions.customers.fetchCustomer).toHaveBeenCalledWith(
            '1',
        )
    })
})
