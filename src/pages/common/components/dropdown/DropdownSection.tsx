import classnames from 'classnames'
import React, {
    ForwardedRef,
    forwardRef,
    HTMLProps,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'

import usePrevious from 'hooks/usePrevious'
import useEffectOnce from 'hooks/useEffectOnce'

import {DropdownContext} from './Dropdown'

import css from './DropdownSection.less'

type Props = {
    title: ReactNode
} & HTMLProps<HTMLDivElement>

function isValidSection(element?: Element | null): boolean {
    return (element?.children.length || 0) > 1
}

const DropdownSection = (
    {children, className, title, ...other}: Props,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownSection must be used within a DropdownContext.Provider'
        )
    }
    const {query} = dropdownContext
    const elementRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => elementRef.current!)
    const previousQuery = usePrevious(query)
    const [shouldRender, setShouldRender] = useState(true)
    const [hasBorder, setHasBorder] = useState(false)

    const handleSiblingChange = useCallback(() => {
        setHasBorder(isValidSection(elementRef.current?.previousElementSibling))
    }, [])

    useEffectOnce(() => {
        handleSiblingChange()
    })
    useEffect(() => {
        if (query !== previousQuery) {
            setShouldRender(isValidSection(elementRef.current))
            handleSiblingChange()
        }
    }, [children, handleSiblingChange, previousQuery, query])

    return (
        <div
            className={classnames(css.wrapper, className, {
                [css.isHidden]: !shouldRender,
                [css.hasBorder]: hasBorder,
            })}
            ref={elementRef}
            {...other}
        >
            <div className={css.title}>{title}</div>

            {children}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(DropdownSection)
