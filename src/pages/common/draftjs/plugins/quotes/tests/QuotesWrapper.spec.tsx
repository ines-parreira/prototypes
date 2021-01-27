import React from 'react'
import {render} from '@testing-library/react'

import QuotesWrapper, {
    QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX,
} from '../QuotesWrapper'

describe('<QuotesWrapper />', () => {
    it('should wrap the element in quote wrapper when element has the quote depth class name', () => {
        const {container} = render(
            <QuotesWrapper>
                <div
                    className={
                        QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX + '5'
                    }
                >
                    Foo
                </div>
            </QuotesWrapper>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not wrap the element with malformed quote depth class name', () => {
        const {container} = render(
            <QuotesWrapper>
                <div
                    className={
                        QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX + 'foo'
                    }
                >
                    Foo
                </div>
            </QuotesWrapper>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should wrap element in the inner wrapper', () => {
        const {container} = render(
            <QuotesWrapper innerWrapper={<section />}>
                <div>Foo</div>
            </QuotesWrapper>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should wrap element in the inner and quote wrappers when element has the quote depth class name', () => {
        const {container} = render(
            <QuotesWrapper innerWrapper={<section />}>
                <div
                    className={
                        QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX + '3'
                    }
                >
                    Foo
                </div>
            </QuotesWrapper>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
