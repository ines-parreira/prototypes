import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import * as ticketFixtures from 'fixtures/ticket'
import * as widgetsFixtures from 'fixtures/widgets'
import { CardTemplate, ListTemplate, Source } from 'models/widget/types'
import { assumeMock } from 'utils/testing'

import List from '../List'
import UIList from '../views/List'

const CHILDREN_TEST_ID = 'childrennnn'

jest.mock('../views/List')
const mockedList = assumeMock(UIList)
mockedList.mockImplementation(
    ({ children, listItems = [] }: Partial<ComponentProps<typeof UIList>>) => (
        <>List {children?.(listItems)}</>
    ),
)

describe('List', () => {
    const source = (
        ticketFixtures.ticket.customer!.integrations as Record<
            string,
            { orders: unknown }
        >
    )['5'].orders as Source[]

    const widget = widgetsFixtures.shopifyWidget
    const template = widget.template.widgets?.[1] as ListTemplate
    template.templatePath = '0.template.widgets.1'
    template.absolutePath = [
        'ticket',
        'customer',
        'integrations',
        '5',
        'orders',
    ]

    const minProps: ComponentProps<typeof List> = {
        isEditing: false,
        parentTemplate: undefined,
        source,
        template,
        children: jest.fn(() => <div>{CHILDREN_TEST_ID}</div>),
    }

    it('should call children with the correct props', () => {
        render(<List {...minProps} />)

        expect(minProps.children).toHaveBeenNthCalledWith(1, source[0], 0)
        expect(minProps.children).toHaveBeenNthCalledWith(2, source[1], 1)
    })

    it('should call List with the correct props', () => {
        const { rerender } = render(<List {...minProps} />)

        expect(mockedList).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                isDraggable: !(minProps.parentTemplate?.type === 'list'),
                dataKey: `${template.path || ''}[]`,
                listItems: source,
                initialItemDisplayedNumber: Number(template.meta?.limit),
                orderBy: undefined,
                isEditing: minProps.isEditing,
            }),
            {},
        )

        const templateVariation = {
            ...template,
            widgets: [
                {
                    ...template.widgets[0],
                    meta: {
                        ...(template.widgets[0] as CardTemplate).meta,
                        displayCard: false,
                    },
                },
                ...template.widgets.slice(1),
            ],
            meta: { ...template.meta, orderBy: '+name' },
        } as ListTemplate

        rerender(
            <List
                {...minProps}
                isEditing={true}
                template={templateVariation}
            />,
        )

        expect(mockedList).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                isEditing: true,
                listItems: source.slice(0, 1),
                orderBy: {
                    key: 'name',
                    direction: 'ASC',
                },
            }),
            {},
        )
    })
})
