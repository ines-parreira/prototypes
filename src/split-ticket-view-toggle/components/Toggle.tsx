import cn from 'classnames'
import React, {useCallback} from 'react'

import useSplitTicketView from '../hooks/useSplitTicketView'

import css from './Toggle.less'

export default function Toggle() {
    const {isEnabled, setIsEnabled} = useSplitTicketView()

    const handleClick = useCallback(() => {
        setIsEnabled(!isEnabled)
    }, [isEnabled, setIsEnabled])

    return (
        <button
            className={cn(css.toggle, {[css.active]: isEnabled})}
            type="button"
            onClick={handleClick}
        >
            {isEnabled ? 'Use full width view' : 'Use split ticket view'}
        </button>
    )
}
