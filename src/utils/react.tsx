import React from 'react'

/**
 * It will render to an element that is a composition
 * of the elements specified in the elements array.
 */
export const ComposedElements = <
    P extends {
        elements: React.ReactNode[]
        children?: React.ReactNode
    }
>(
    props: P
) => {
    const {elements, children, ...otherProps} = props
    if (!elements.length) {
        return null
    }
    const composedElement = elements.reduceRight((acc, element) => {
        return React.isValidElement(element)
            ? React.cloneElement(element, {children: acc})
            : acc
    }, children) as React.ReactElement
    return React.cloneElement(composedElement, otherProps)
}
