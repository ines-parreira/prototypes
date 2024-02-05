import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map, List as ImmutableList} from 'immutable'

import * as widgetsFixtures from 'fixtures/widgets'
import * as ticketFixtures from 'fixtures/ticket'
import {assumeMock} from 'utils/testing'
import UIList from 'infobar/ui/List'

import {widgetReference} from '../../widgetReference'

import ListInfobarWidget from '../List'

jest.mock('../../widgetReference', () => {
    const Widget = jest.fn(() => <></>)

    return {
        widgetReference: {
            Widget,
        },
    }
})

jest.mock('infobar/ui/List')

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

    const source = fromJS(
        (
            ticketFixtures.ticket.customer!.integrations as Record<
                string,
                {orders: unknown}
            >
        )['5'].orders
    ) as ImmutableList<Map<string, unknown>>

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
        removeBorderTop: true,
    }

    it('should return null', () => {
        const {container, rerender} = render(
            <ListInfobarWidget {...minProps} template={fromJS({widgets: []})} />
        )
        expect(container.firstChild).toBeNull()

        rerender(<ListInfobarWidget {...minProps} source={fromJS([])} />)
        expect(container.firstChild).toBeNull()

        rerender(<ListInfobarWidget {...minProps} source={fromJS({})} />)
        expect(container.firstChild).toBeNull()
    })

    it('should call InfobarWidget with the correct props', () => {
        render(<ListInfobarWidget {...minProps} />)

        expect(InfobarWidget).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                open: true,
                source: source.get(0),
                removeBorderTop: true,
            }),
            {}
        )
        expect(InfobarWidget).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                open: false,
                source: source.get(1),
                removeBorderTop: false,
            }),
            {}
        )

        const updatedTemplate = minProps.template.set(
            'absolutePath',
            (template.get('absolutePath') as ImmutableList<string>).concat([
                '[]',
            ])
        )

        const passedTemplate = (
            updatedTemplate.getIn(['widgets', '0']) as Map<unknown, unknown>
        ).set(
            'templatePath',
            `${updatedTemplate.get('templatePath', '') as string}.widgets.0`
        )

        expect(InfobarWidget).toHaveBeenCalledWith(
            expect.objectContaining({
                widget: minProps.widget,
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
                dataKey: `${template.get('path') as string}[]`,
                listItems: minProps.source.toJS(),
                initialItemDisplayedNumber: Number(
                    template.getIn(['meta', 'limit'])
                ),
                orderBy: undefined,
                isEditing: minProps.isEditing,
            }),
            {}
        )

        let templateVariation = minProps.template.setIn(
            ['widgets', '0', 'meta', 'displayCard'],
            false
        )

        templateVariation = templateVariation.setIn(
            ['meta', 'orderBy'],
            '+name'
        )

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
                listItems: minProps.source.setSize(1).toJS(),
                orderBy: {
                    key: 'name',
                    direction: 'ASC',
                },
            }),
            {}
        )
    })
})
