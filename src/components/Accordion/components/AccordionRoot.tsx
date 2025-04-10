import { forwardRef, useCallback, useMemo, useState } from 'react'
import type { ComponentProps } from 'react'

import classNames from 'classnames'

import useId from 'hooks/useId'

import { AccordionRootContext } from '../contexts/accordion-root-context'
import { AccordionProps, AccordionValue } from '../utils/types'

import css from './AccordionRoot.less'

type AccordionRootProps = ComponentProps<'div'> & AccordionProps

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
        const [value, setValue] = useState<AccordionValue>(initialValue ?? [])
        const id = useId()

        const handleValueChange = useCallback(
            (accordionValue: string) => {
                if (multiple) {
                    const nextValue = value.includes(accordionValue)
                        ? value.filter((v) => v !== accordionValue)
                        : [...value, accordionValue]

                    setValue(nextValue)
                    onValueChange?.(nextValue)
                } else {
                    setValue([accordionValue])
                    onValueChange?.([accordionValue])
                }
            },
            [multiple, onValueChange, value],
        )

        const values = useMemo(
            () => ({
                id: rootId ?? id,
                value,
                handleValueChange,
                multiple,
                disabled,
            }),
            [rootId, id, value, handleValueChange, multiple, disabled],
        )

        return (
            <AccordionRootContext.Provider value={values}>
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
