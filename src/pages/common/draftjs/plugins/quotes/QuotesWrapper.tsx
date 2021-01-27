import React, {useMemo} from 'react'
import classNames from 'classnames'

import {ComposedElements} from '../../../../../utils/react'

import styles from './quotesBlockStyle.less'

export const QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX =
    'draftjs-quote-plugin-wrapper-depth--'

const WRAPPED_ELEMENT_CLASS_NAME_REGEXP = new RegExp(
    QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX + '(\\d+)'
)

type Props = {
    innerWrapper?: React.ReactNode
    children?: React.ReactNode
}

const QuotesWrapper = ({innerWrapper, children}: Props) => {
    const firstChild = React.Children.toArray(children)[0]
    const quoteDepth = useMemo(() => {
        if (firstChild && React.isValidElement(firstChild)) {
            const match = (firstChild as React.ReactElement<{
                className?: string
            }>).props.className?.match(WRAPPED_ELEMENT_CLASS_NAME_REGEXP)
            if (match) {
                return parseInt(match[1]) || 0
            }
        }
        return 0
    }, [firstChild])

    return (
        <ComposedElements
            className={
                quoteDepth > 0
                    ? classNames(
                          styles.replyThread,
                          styles['quoteDepth' + quoteDepth.toString()]
                      )
                    : undefined
            }
            elements={[<div key="quote-wrapper" />, innerWrapper]}
        >
            {children}
        </ComposedElements>
    )
}

export default QuotesWrapper
