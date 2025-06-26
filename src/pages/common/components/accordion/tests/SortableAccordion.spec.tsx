import React from 'react'

import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import _noop from 'lodash/noop'

import { renderWithDnD } from 'utils/testing'

import AccordionBody from '../AccordionBody'
import SortableAccordion from '../SortableAccordion'
import SortableAccordionHeader from '../SortableAccordionHeader'
import SortableAccordionItem from '../SortableAccordionItem'

describe('<SortableAccordion />', () => {
    it('should render sortable accordion component', () => {
        const { container } = renderWithDnD(
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
            </SortableAccordion>,
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
            </SortableAccordion>,
        )

        const accordionItem = screen.getByText('Header 1').parentElement!

        act(() => {
            const dragHandle = within(
                screen.getByText('Header 2').parentElement!,
            ).getByText('drag_indicator')

            // Get bounding rectangles for realistic coordinates
            const dragRect = dragHandle.getBoundingClientRect()

            const clientX = dragRect.left + dragRect.width / 2
            const clientY = dragRect.top + dragRect.height / 2

            fireEvent.dragStart(dragHandle, { clientX, clientY })
            fireEvent.dragEnter(accordionItem, { clientX, clientY })
            fireEvent.dragOver(accordionItem, { clientX, clientY })
        })

        act(() => {
            const dropRect = accordionItem.getBoundingClientRect()
            const clientX = dropRect.left + dropRect.width / 2
            const clientY = dropRect.top + dropRect.height / 2

            fireEvent.drop(accordionItem, { clientX, clientY })
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
            </SortableAccordion>,
        )

        const accordionItem = screen.getByText('Header 2').parentElement!

        act(() => {
            const dragHandle = within(accordionItem).getByText('drag_indicator')

            // Get bounding rectangles for realistic coordinates
            const dragRect = dragHandle.getBoundingClientRect()

            const clientX = dragRect.left + dragRect.width / 2
            const clientY = dragRect.top + dragRect.height / 2

            // Start drag from item 2's handle
            fireEvent.dragStart(dragHandle, { clientX, clientY })

            // Drop back on item 2 without triggering hover on item 1
            // This simulates starting a drag but then dropping back on the same item
            fireEvent.drop(accordionItem, { clientX, clientY })
        })

        await waitFor(() => {
            expect(onReorderMock).not.toBeCalled()
        })
    })
})
