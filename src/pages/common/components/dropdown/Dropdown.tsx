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
} from '@floating-ui/react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import React, {
    createContext,
    forwardRef,
    Fragment,
    HTMLAttributes,
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
import usePrevious from 'hooks/usePrevious'
import useUpdateEffect from 'hooks/useUpdateEffect'
import useEvent from 'hooks/useEvent'
import useKey from 'hooks/useKey'

import {useAppNode} from 'appNode'
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
    shouldFlip?: boolean
} & Pick<HTMLAttributes<HTMLDivElement>, 'id'>

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
            shouldFlip = true,
            ...props
        }: Props,
        ref: Ref<HTMLElement> | null | undefined
    ) => {
        const {x, y, refs, strategy, update} = useFloating<HTMLElement>({
            placement,
            middleware: [
                shift(),
                offsetMiddleware(offset),
                shouldFlip &&
                    flip({
                        fallbackPlacements: ['right', 'bottom', 'top', 'left'],
                        padding: safeDistance,
                    }),
                size({
                    apply({elements}) {
                        Object.assign(elements.floating.style ?? {}, {
                            [contained ? 'width' : 'minWidth']: `${
                                elements.reference.getBoundingClientRect().width
                            }px`,
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

        const appNode = useAppNode()
        const floatingPortalRoot = useMemo(
            () => root ?? appNode,
            [appNode, root]
        )

        useLayoutEffect(() => {
            refs.setReference(currentTarget)
        }, [currentTarget, refs])

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
        useKey(
            'Escape',
            () => {
                if (isOpen) {
                    onToggle(false)
                }
            },
            undefined,
            [isOpen, onToggle]
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
                <FloatingPortal root={floatingPortalRoot}>
                    {isOpen && !isDisabled && (
                        <FloatingOverlay
                            className={css.overlay}
                            onClick={handleToggle}
                            data-testid="floating-overlay"
                        >
                            <div
                                className={classnames(css.wrapper, className)}
                                ref={refs.setFloating}
                                style={{
                                    left: x ?? '',
                                    position: strategy,
                                    top: y ?? '',
                                }}
                                {...props}
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
