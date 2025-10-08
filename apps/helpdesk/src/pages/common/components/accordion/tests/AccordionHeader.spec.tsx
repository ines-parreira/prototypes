import React from 'react'

import { render, screen } from '@testing-library/react'

import Accordion from '../Accordion'
import AccordionBody from '../AccordionBody'
import AccordionHeader from '../AccordionHeader'
import AccordionItem from '../AccordionItem'

describe('<AccordionHeader />', () => {
    it('should render toggle icon when isExpandable is true', () => {
        render(
            <Accordion defaultExpandedItem="1">
                <AccordionItem id="1">
                    <AccordionHeader isExpandable={true}>
                        Header 1
                    </AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
            </Accordion>,
        )

        expect(screen.getByText('keyboard_arrow_up')).toBeInTheDocument()
    })

    it('should render toggle icon by default when isExpandable is not specified', () => {
        render(
            <Accordion defaultExpandedItem="1">
                <AccordionItem id="1">
                    <AccordionHeader>Header 1</AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
            </Accordion>,
        )

        expect(screen.getByText('keyboard_arrow_up')).toBeInTheDocument()
    })

    it('should not render toggle icon when isExpandable is false', () => {
        render(
            <Accordion defaultExpandedItem="1">
                <AccordionItem id="1">
                    <AccordionHeader isExpandable={false}>
                        Header 1
                    </AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
            </Accordion>,
        )

        expect(screen.queryByText('keyboard_arrow_up')).not.toBeInTheDocument()
        expect(
            screen.queryByText('keyboard_arrow_down'),
        ).not.toBeInTheDocument()
    })

    it('should render down arrow when collapsed and isExpandable is true', () => {
        render(
            <Accordion>
                <AccordionItem id="1">
                    <AccordionHeader isExpandable={true}>
                        Header 1
                    </AccordionHeader>
                    <AccordionBody>Body 1</AccordionBody>
                </AccordionItem>
            </Accordion>,
        )

        expect(screen.getByText('keyboard_arrow_down')).toBeInTheDocument()
        expect(screen.queryByText('keyboard_arrow_up')).not.toBeInTheDocument()
    })
})
