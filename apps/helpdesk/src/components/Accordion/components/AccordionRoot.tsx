import { forwardRef, useCallback, useMemo, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { AccordionRootContext } from '../contexts/accordion-root-context'
import type {
    AccordionProps,
    AccordionValue,
    AccordionValues,
} from '../utils/types'

import css from './AccordionRoot.less'

export type AccordionRootProps = ComponentPropsWithoutRef<'div'> &
    AccordionProps

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Disclosure />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const AccordionRoot = forwardRef<HTMLDivElement, AccordionRootProps>(
    (
        {
            value: initialValue,
            onValueChange,
            id: rootId,
            multiple = true,
            disabled = false,
            children,
            className,
            ...props
        },
        ref,
    ) => {
        const [values, setValues] = useState<AccordionValues>(
            initialValue ?? [],
        )
        const id = useId()

        const handleValueChange = useCallback(
            (accordionValue: AccordionValue) => {
                if (multiple) {
                    const nextValue = values.includes(accordionValue)
                        ? values.filter((v) => v !== accordionValue)
                        : [...values, accordionValue]

                    setValues(nextValue)
                    onValueChange?.(nextValue)
                } else {
                    setValues([accordionValue])
                    onValueChange?.([accordionValue])
                }
            },
            [multiple, onValueChange, values],
        )

        const memoizedValues = useMemo(
            () => ({
                id: rootId ?? id,
                values,
                handleValueChange,
                multiple,
                disabled,
            }),
            [rootId, id, values, handleValueChange, multiple, disabled],
        )

        return (
            <AccordionRootContext.Provider value={memoizedValues}>
                <div
                    ref={ref}
                    {...props}
                    className={classNames(css.root, className)}
                >
                    {children}
                </div>
            </AccordionRootContext.Provider>
        )
    },
)
