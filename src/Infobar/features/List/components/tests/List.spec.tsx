import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import * as widgetsFixtures from 'fixtures/widgets'
import * as ticketFixtures from 'fixtures/ticket'
import {assumeMock} from 'utils/testing'
import UIList from 'Infobar/features/List/display/List'
import {CardTemplate, ListTemplate, Source} from 'models/widget/types'
import {widgetReference} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgetReference'

import ListInfobarWidget from '../List'

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgetReference',
    () => {
        const Widget = jest.fn(() => <></>)

        return {
            widgetReference: {
                Widget,
            },
        }
    }
)

jest.mock('Infobar/features/List/display/List')

const InfobarWidget = assumeMock(widgetReference.Widget)
const mockedList = assumeMock(UIList)

describe('Infobar::Widgets::List', () => {
    beforeEach(() => {
        mockedList.mockImplementation(
            ({
                children,
                listItems = [],
            }: Partial<ComponentProps<typeof UIList>>) => (
                <>List {children?.(listItems)}</>
            )
        )
    })

    const source = (
        ticketFixtures.ticket.customer!.integrations as Record<
            string,
            {orders: unknown}
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

    const minProps: ComponentProps<typeof ListInfobarWidget> = {
        isEditing: false,
        isParentList: false,
        source,
        template,
        hasNoBorderTop: true,
    }

    it('should return null when template widgets are an empty array', () => {
        const {container} = render(
            <ListInfobarWidget
                {...minProps}
                template={{widgets: []} as unknown as ListTemplate}
            />
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when source is an empty list', () => {
        const {container} = render(
            <ListInfobarWidget {...minProps} source={[]} />
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when source is not a list', () => {
        const {container} = render(
            <ListInfobarWidget {...minProps} source={{}} />
        )

        expect(container.firstChild).toBeNull()
    })

    // Regression: https://linear.app/gorgias/issue/CRM-2864/typeerror-rsetsize-is-not-a-function
    it('should return null when source is not a list and has only content', () => {
        const card: CardTemplate = {
            type: 'card',
            path: '3.template.widgets.0.card',
            widgets: [
                {
                    type: 'text',
                    path: '3.template.widgets.0.card.widgets.0',
                    title: 'bar',
                },
            ],
        }
        const list: ListTemplate = {
            type: 'list',
            path: '3.template',
            widgets: [card],
        }

        const {container} = render(
            <ListInfobarWidget {...minProps} template={list} source={{}} />
        )

        expect(container.firstChild).toBeNull()
    })

    // Regression: https://linear.app/gorgias/issue/CRM-2865/typeerror-rtojs-is-not-a-function
    it('should return null when source is a string', () => {
        const {container} = render(
            <ListInfobarWidget {...minProps} source="foo" />
        )

        expect(container.firstChild).toBeNull()
    })

    it('should call InfobarWidget with the correct props', () => {
        render(<ListInfobarWidget {...minProps} />)

        expect(InfobarWidget).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                isOpen: true,
                source: source[0],
                hasNoBorderTop: true,
            }),
            {}
        )
        expect(InfobarWidget).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                isOpen: false,
                source: source[1],
                hasNoBorderTop: false,
            }),
            {}
        )

        const updatedTemplate = {
            ...template,
            absolutePath: template.absolutePath?.concat(['[]']),
        }

        const passedTemplate = {
            ...template.widgets[0],
            templatePath: `${template.templatePath || ''}.widgets.0`,
        }

        expect(InfobarWidget).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                parent: updatedTemplate,
                template: passedTemplate,
            }),
            {}
        )
    })

    it('should call List with the correct props', () => {
        const {rerender} = render(<ListInfobarWidget {...minProps} />)

        expect(mockedList).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                isDraggable: !minProps.isParentList,
                dataKey: `${template.path || ''}[]`,
                listItems: source,
                initialItemDisplayedNumber: Number(template.meta?.limit),
                orderBy: undefined,
                isEditing: minProps.isEditing,
            }),
            {}
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
            meta: {...template.meta, orderBy: '+name'},
        } as ListTemplate

        rerender(
            <ListInfobarWidget
                {...minProps}
                isEditing={true}
                template={templateVariation}
            />
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
            {}
        )
    })
})
