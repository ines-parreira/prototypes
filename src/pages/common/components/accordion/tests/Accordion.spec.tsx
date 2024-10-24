import {render, screen, act, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'

import Accordion from '../Accordion'
import AccordionBody from '../AccordionBody'
import AccordionHeader from '../AccordionHeader'
import AccordionItem from '../AccordionItem'

describe('<Accordion />', () => {
    it('should render accordion component', () => {
        const {container} = render(
            <Accordion>
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem id="2">
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse malesuada lacus ex, sit amet blandit leo
                        lobortis eget.
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render expanded accordion component', () => {
        render(
            <Accordion defaultExpandedItem="2">
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
                <AccordionItem id="2">
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        expect(screen.getByText('Body 2').parentElement).not.toHaveClass(
            'isCollapsed'
        )
    })

    it('should expand accordion item on header click', async () => {
        render(
            <Accordion>
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
                <AccordionItem id="2">
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        act(() => {
            fireEvent.click(screen.getByText('Header 2'))
        })

        await waitFor(() => {
            expect(screen.getByText('Body 2').parentElement).not.toHaveClass(
                'isCollapsed'
            )
        })
    })

    it('should collapse accordion item if other item was expanded', async () => {
        render(
            <Accordion defaultExpandedItem="2">
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
                <AccordionItem id="2">
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        act(() => {
            fireEvent.click(screen.getByText('Header 1'))
        })

        await waitFor(() => {
            expect(screen.getByText('Body 2').parentElement).toHaveClass(
                'isCollapsed'
            )
        })
    })

    it('should collapse accordion item on arrow_up icon click', async () => {
        render(
            <Accordion defaultExpandedItem="2">
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
                <AccordionItem id="2">
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        act(() => {
            fireEvent.click(screen.getByText('keyboard_arrow_up'))
        })

        await waitFor(() => {
            expect(screen.getByText('Body 2').parentElement).toHaveClass(
                'isCollapsed'
            )
        })
    })

    it('should not expand accordion item if it is disabled', async () => {
        render(
            <Accordion>
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
                <AccordionItem id="2" isDisabled>
                    <AccordionHeader>Header 2</AccordionHeader>
                    <AccordionBody>Body 2</AccordionBody>
                </AccordionItem>
            </Accordion>
        )

        act(() => {
            fireEvent.click(screen.getByText('Header 2'))
        })

        await waitFor(() => {
            expect(screen.getByText('Body 2').parentElement).toHaveClass(
                'isCollapsed'
            )
        })
    })
})
