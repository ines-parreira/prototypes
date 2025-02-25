import React, { ReactNode } from 'react'

import cn from 'classnames'

import css from './TourTooltip.less'

type Props = {
    isOpen: boolean
    text: string
    children: ReactNode
}

const TourTooltip = ({ isOpen, text, children }: Props) => {
    return (
        <>
            <div className={cn(css.tooltipWrapper, 'tooltip')} role="tooltip">
                {isOpen && (
                    <div className={cn(css.tooltipTip, 'tooltip-inner')}>
                        {text}
                    </div>
                )}
                {children}
            </div>
        </>
    )
}

export default TourTooltip
