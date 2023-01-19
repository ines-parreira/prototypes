import React from 'react'
import _noop from 'lodash/noop'
import {act, screen, fireEvent, waitFor, within} from '@testing-library/react'

import {renderWithDnD} from 'utils/testing'

import SortableAccordion from '../SortableAccordion'
import SortableAccordionItem from '../SortableAccordionItem'
import SortableAccordionHeader from '../SortableAccordionHeader'
import AccordionBody from '../AccordionBody'

describe('<SortableAccordion />', () => {
    it('should render sortable accordion component', () => {
        const {container} = renderWithDnD(
            <SortableAccordion onReorder={_noop}>
                <SortableAccordionItem id="1">
                    <SortableAccordionHeader>Header 1</SortableAccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </SortableAccordionItem>
                <SortableAccordionItem id="2">
                    <SortableAccordionHeader>Header 2</SortableAccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </SortableAccordionItem>
            </SortableAccordion>
        )

        expect(container).toMatchSnapshot()
    })

    it('should reorder sortable accordion items', async () => {
        const onReorderMock = jest.fn()

        renderWithDnD(
            <SortableAccordion onReorder={onReorderMock}>
                <SortableAccordionItem id="1">
                    <SortableAccordionHeader>Header 1</SortableAccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </SortableAccordionItem>
                <SortableAccordionItem id="2">
                    <SortableAccordionHeader>Header 2</SortableAccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </SortableAccordionItem>
            </SortableAccordion>
        )

        const accordionItem = screen.getByText('Header 1').parentElement!

        act(() => {
            const dragHandle = within(
                screen.getByText('Header 2').parentElement!
            ).getByText('drag_indicator')

            fireEvent.dragStart(dragHandle)
            fireEvent.dragOver(accordionItem)
        })

        act(() => {
            fireEvent.drop(accordionItem)
        })

        await waitFor(() => {
            expect(onReorderMock).toBeCalledWith(['2', '1'])
        })
    })

    it('should not reorder sortable accordion items if item was not dropped in a new position', async () => {
        const onReorderMock = jest.fn()

        renderWithDnD(
            <SortableAccordion onReorder={onReorderMock}>
                <SortableAccordionItem id="1">
                    <SortableAccordionHeader>Header 1</SortableAccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </SortableAccordionItem>
                <SortableAccordionItem id="2">
                    <SortableAccordionHeader>Header 2</SortableAccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </SortableAccordionItem>
            </SortableAccordion>
        )

        const accordionItem1 = screen.getByText('Header 1').parentElement!
        const accordionItem2 = screen.getByText('Header 2').parentElement!

        act(() => {
            const dragHandle =
                within(accordionItem2).getByText('drag_indicator')

            fireEvent.dragStart(dragHandle)
            fireEvent.dragOver(accordionItem1)
        })

        act(() => {
            fireEvent.dragOver(accordionItem1)
        })

        act(() => {
            fireEvent.drop(accordionItem2)
        })

        await waitFor(() => {
            expect(onReorderMock).not.toBeCalled()
        })
    })
})
