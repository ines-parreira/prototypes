import React, {
    MouseEvent,
    ReactNode,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import logoShopify from 'assets/img/integrations/shopify.svg'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import { parseGuidanceVariable } from './utils'

import css from './GuidanceVariableTag.less'

export type GuidanceVariableTagProps = {
    value: string
    size?: 'small' | 'normal'
    onClick?: (element: HTMLElement) => void
    children: ReactNode
}

export default function GuidanceVariableTag({
    value,
    size = 'normal',
    onClick,
    children,
}: GuidanceVariableTagProps) {
    const { guidanceVariables } = useToolbarContext()
    const contentRef = useRef<HTMLSpanElement>(null)
    const randomId = useId()
    const wrapperId = `guidance-variable-tag-${randomId}`

    const [isTextOverflow, setIsTextOverflow] = useState(false)

    useLayoutEffect(() => {
        if (contentRef.current) {
            setIsTextOverflow(
                contentRef.current?.offsetWidth <
                    contentRef.current?.scrollWidth,
            )
        }
    }, [])

    const variable = useMemo(
        () => parseGuidanceVariable(value, guidanceVariables || []),
        [value, guidanceVariables],
    )

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            onClick?.(event.currentTarget)
        },
        [onClick],
    )

    const variableName = useMemo(() => {
        if (!variable) return 'Invalid variable'

        const prefix = variable.category === 'customer' ? 'Customer' : 'Order'

        return `${prefix}: ${variable.name}`
    }, [variable])

    return (
        <span id={wrapperId} className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: !variable,
                })}
                contentEditable={false}
                onClick={handleClick}
            >
                <img
                    src={logoShopify}
                    alt="shopify logo"
                    className={css.shopifyLogo}
                    width={14}
                    height={14}
                />
                <span
                    ref={contentRef}
                    className={classNames(css.content, css[size])}
                    aria-label={variableName}
                />
            </span>

            <span className={css.children}>{children}</span>
            {isTextOverflow && (
                <Tooltip
                    innerProps={{
                        modifiers: {
                            // Editor parent container has overflow: hidden
                            preventOverflow: {
                                escapeWithReference: true,
                            },
                        },
                    }}
                    target={wrapperId}
                    placement="top-start"
                >
                    {variableName}
                </Tooltip>
            )}
        </span>
    )
}
