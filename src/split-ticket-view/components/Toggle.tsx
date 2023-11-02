import cn from 'classnames'
import React, {useCallback} from 'react'

import useSplitTicketView from '../hooks/useSplitTicketView'

import css from './Toggle.less'

export default function Toggle() {
    const [enabled, setEnabled] = useSplitTicketView()

    const handleClick = useCallback(() => {
        setEnabled(!enabled)
    }, [enabled, setEnabled])

    return (
        <button
            className={cn(css.toggle, {[css.active]: enabled})}
            type="button"
            onClick={handleClick}
        >
            {enabled ? 'Use full width view' : 'Use split ticket view'}
        </button>
    )
}
