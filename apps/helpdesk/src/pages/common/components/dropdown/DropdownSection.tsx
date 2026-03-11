import type { ForwardedRef, HTMLProps, ReactNode } from 'react'
import {
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'

import { useEffectOnce, usePrevious } from '@repo/hooks'
import classnames from 'classnames'

import { DropdownContext } from './Dropdown'

import css from './DropdownSection.less'

type Props = {
    title: ReactNode
    alwaysRender?: boolean
} & HTMLProps<HTMLDivElement>

function isValidSection(element?: Element | null): boolean {
    return (element?.children.length || 0) > 1
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const DropdownSection = (
    { children, className, title, alwaysRender = false, ...other }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownSection must be used within a DropdownContext.Provider',
        )
    }
    const { query } = dropdownContext
    const elementRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => elementRef.current!)
    const previousQuery = usePrevious(query)
    const [shouldRender, setShouldRender] = useState(true)
    const [hasBorder, setHasBorder] = useState(false)

    const handleSiblingChange = useCallback(() => {
        setHasBorder(
            alwaysRender
                ? !!elementRef.current?.previousElementSibling
                : isValidSection(elementRef.current?.previousElementSibling),
        )
    }, [alwaysRender])

    useEffectOnce(() => {
        handleSiblingChange()
    })
    useEffect(() => {
        if (query !== previousQuery) {
            setShouldRender(alwaysRender || isValidSection(elementRef.current))
            handleSiblingChange()
        }
    }, [children, handleSiblingChange, previousQuery, query, alwaysRender])

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
