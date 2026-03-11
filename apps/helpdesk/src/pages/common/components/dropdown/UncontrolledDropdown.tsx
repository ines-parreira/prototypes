import type { ComponentProps } from 'react'
import React, { useCallback, useEffect, useState } from 'react'

import Dropdown from './Dropdown'

type Props = Omit<ComponentProps<typeof Dropdown>, 'isOpen' | 'onToggle'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export default function UncontrolledDropdown({ target, ...other }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen])

    useEffect(() => {
        const current = target.current
        current?.addEventListener('click', handleToggle)

        return () => {
            current?.removeEventListener('click', handleToggle)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleToggle, target.current])

    return (
        <Dropdown
            {...other}
            isOpen={isOpen}
            onToggle={setIsOpen}
            target={target}
        />
    )
}
