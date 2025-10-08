import React, { PropsWithChildren } from 'react'

import { Tooltip } from '@gorgias/axiom'

import css from './Section.less'

type ISectionProps = {
    icon: string
    title: string
    tooltip?: string
    tooltipTarget?: string
    noBorder?: boolean
}

export const Section: React.FC<PropsWithChildren<ISectionProps>> = ({
    icon,
    title,
    tooltip,
    tooltipTarget,
    noBorder = false,
    children,
}) => {
    return (
        <div>
            <div className={css.title}>
                <i className="material-icons">{icon}</i>
                {title}
                {tooltip && tooltipTarget && (
                    <>
                        <Tooltip
                            target={tooltipTarget}
                            placement="top"
                            autohide={false}
                        >
                            {tooltip}
                        </Tooltip>
                        <i
                            id={tooltipTarget}
                            className={`material-icons-outlined ${css.infoIcon}`}
                        >
                            info
                        </i>
                    </>
                )}
            </div>
            <div className={noBorder ? css.cardNoBorder : css.card}>
                {children}
            </div>
        </div>
    )
}
