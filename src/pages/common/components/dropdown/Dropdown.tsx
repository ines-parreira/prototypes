import {
    autoUpdate,
    flip,
    FloatingOverlay,
    FloatingPortal,
    offset as offsetMiddleware,
    Placement,
    shift,
    size,
    useFloating,
} from '@floating-ui/react-dom-interactions'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import React, {
    createContext,
    forwardRef,
    Fragment,
    MouseEvent,
    ReactNode,
    Ref,
    RefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'
import {useEvent, usePrevious, useUpdateEffect} from 'react-use'

import css from './Dropdown.less'

type Props = {
    children?: ReactNode
    className?: string
    isDisabled?: boolean
    isMultiple?: boolean
    isOpen: boolean
    offset?: number
    onToggle: (isVisible: boolean) => void
    placement?: Placement
    root?: HTMLElement
    safeDistance?: number
    target: RefObject<HTMLElement | null>
    value?: boolean | number | string | Array<number | string> | null
    contained?: boolean
}

type DropdownContextState = Pick<Props, 'isMultiple' | 'onToggle' | 'value'> & {
    getHighlightedLabel: (label: string) => ReactNode
    onQueryChange: (query: string) => void
    query: string
}

export const DropdownContext = createContext<DropdownContextState | null>(null)

const Dropdown = forwardRef(
    (
        {
            children,
            className,
            isDisabled,
            isMultiple,
            isOpen,
            offset = 4,
            onToggle,
            placement = 'bottom-start',
            root,
            safeDistance = 8,
            target,
            value,
            contained = false,
        }: Props,
        ref: Ref<HTMLElement> | null | undefined
    ) => {
        const {x, y, reference, floating, refs, strategy, update} =
            useFloating<HTMLElement>({
                placement,
                middleware: [
                    shift(),
                    offsetMiddleware(offset),
                    flip({
                        fallbackPlacements: ['right', 'bottom', 'top', 'left'],
                        padding: safeDistance,
                    }),
                    size({
                        apply({reference}) {
                            Object.assign(refs.floating.current?.style ?? {}, {
                                [contained
                                    ? 'width'
                                    : 'minWidth']: `${reference.width}px`,
                            })
                        },
                        padding: safeDistance,
                    }),
                ],
            })
        const currentFloatingElement = refs.floating.current!
        useImperativeHandle(ref, () => currentFloatingElement, [
            currentFloatingElement,
        ])
        const currentTarget = target.current
        const [query, setQuery] = useState('')
        const previousQuery = usePrevious(query)

        useLayoutEffect(() => {
            reference(currentTarget)
        }, [currentTarget, reference])

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const handleUpdate = useCallback(
            _debounce(
                () => {
                    if (!refs.reference.current || !refs.floating.current) {
                        return
                    }
                    return autoUpdate(
                        refs.reference.current,
                        refs.floating.current,
                        update
                    )
                },
                50,
                {leading: true}
            ),
            [children, refs.reference, refs.floating, update]
        )

        useEffect(handleUpdate, [handleUpdate])

        useUpdateEffect(() => {
            if (previousQuery !== query) {
                handleUpdate()
            }
        }, [handleUpdate, query, previousQuery])

        useEvent('scroll', handleUpdate)

        const getHighlightedLabel = useCallback(
            (label: string) => {
                if (
                    query.length === 0 ||
                    !label.toLowerCase().includes(query.toLowerCase())
                ) {
                    return label
                }
                const substrings = label.split(new RegExp(query, 'ig'))

                return (
                    <>
                        {substrings.map((substring, index) => (
                            <Fragment key={`${substring}${index}`}>
                                {!!substring.length && (
                                    <span className={css.subLabel}>
                                        {substring}
                                    </span>
                                )}

                                {index < substrings.length - 1 && (
                                    <span className={css.highlightedLabel}>
                                        {query}
                                    </span>
                                )}
                            </Fragment>
                        ))}
                    </>
                )
            },
            [query]
        )

        const handleToggle = useCallback(
            (event: MouseEvent) => {
                event.preventDefault()
                event.stopPropagation()
                if (
                    isOpen &&
                    !refs.floating.current?.contains(event.target as Node)
                ) {
                    onToggle(!isOpen)
                }
            },
            [isOpen, onToggle, refs]
        )

        const handleQueryChange = useCallback((nextQuery: string) => {
            setQuery(nextQuery.trim())
        }, [])

        const contextValue = useMemo(
            () => ({
                getHighlightedLabel,
                isMultiple,
                onQueryChange: handleQueryChange,
                onToggle,
                query,
                value,
            }),
            [
                getHighlightedLabel,
                handleQueryChange,
                isMultiple,
                onToggle,
                query,
                value,
            ]
        )

        return (
            <DropdownContext.Provider value={contextValue}>
                <FloatingPortal root={root}>
                    {isOpen && !isDisabled && (
                        <FloatingOverlay
                            className={css.overlay}
                            onClick={handleToggle}
                        >
                            <div
                                className={classnames(css.wrapper, className)}
                                ref={floating}
                                style={{
                                    left: x ?? '',
                                    position: strategy,
                                    top: y ?? '',
                                }}
                            >
                                {children}
                            </div>
                        </FloatingOverlay>
                    )}
                </FloatingPortal>
            </DropdownContext.Provider>
        )
    }
)

export default Dropdown
