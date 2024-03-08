import React from 'react'
import {screen, render} from '@testing-library/react'

import Accordion from 'pages/common/components/accordion/Accordion'

import {StatefulAccordion} from '../StatefulAccordion'

describe('<StatefulAccordion />', () => {
    it('should render the default accordion', () => {
        const {getByText, getByAltText} = render(
            <Accordion>
                <StatefulAccordion title="Set up the basics">
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        getByText('Set up the basics')
        expect(() => getByAltText('check icon state')).toThrow()
        expect(() => getByAltText('warning icon state')).toThrow()
    })

    it('renders the count', () => {
        const {getByText} = render(
            <Accordion>
                <StatefulAccordion count={2} title="Set up the basics">
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        getByText('2')
    })

    it('renders the valid state', () => {
        const {getByAltText} = render(
            <Accordion>
                <StatefulAccordion isValid title="Set up the basics">
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        getByAltText('check icon state')
    })

    it('renders the invalid state', () => {
        const {getByAltText} = render(
            <Accordion>
                <StatefulAccordion isInvalid title="Set up the basics">
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        getByAltText('warning icon state')
    })

    it('renders only the last state', () => {
        const {rerender} = render(
            <Accordion>
                <StatefulAccordion count={2} isValid title="Set up the basics">
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        expect(() => screen.getByText('2')).toThrow()
        screen.getByAltText('check icon state')
        expect(() => screen.getByAltText('warning icon state')).toThrow()

        rerender(
            <Accordion>
                <StatefulAccordion
                    count={2}
                    isValid
                    isInvalid
                    title="Set up the basics"
                >
                    Lorem ipsum dolor
                </StatefulAccordion>
            </Accordion>
        )

        expect(() => screen.getByText('2')).toThrow()
        expect(() => screen.getByAltText('check icon state')).toThrow()
        screen.getByAltText('warning icon state')
    })
})
