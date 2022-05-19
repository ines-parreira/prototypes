import React, {ComponentProps, useCallback, useEffect, useState} from 'react'

import Dropdown from './Dropdown'

type Props = Omit<ComponentProps<typeof Dropdown>, 'isOpen' | 'onToggle'>

export default function UncontrolledDropdown({target, ...other}: Props) {
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
