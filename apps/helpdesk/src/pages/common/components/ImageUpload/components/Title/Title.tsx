import type { FunctionComponent, ReactChild } from 'react'
import React, { createRef } from 'react'

import classNames from 'classnames'
import type { UncontrolledTooltipProps } from 'reactstrap'

import { LegacyTooltip as TooltipComponent } from '@gorgias/axiom'

import css from './Title.less'

export type TitleProps = {
    children: ReactChild
    help?: string
    Tooltip?: Omit<UncontrolledTooltipProps, 'target'>
}

export const Title: FunctionComponent<TitleProps> = ({
    children,
    help,
    Tooltip,
}: TitleProps) => {
    const ref = createRef<HTMLDivElement>()

    return (
        <>
            <div className={css.container}>
                {children}
                {help && (
                    <i
                        ref={ref}
                        role="img"
                        className={classNames(
                            css.help,
                            'material-icons-outlined ml-2',
                        )}
                    >
                        info
                    </i>
                )}
            </div>
            {help && (
                <TooltipComponent {...Tooltip} target={ref}>
                    {help}
                </TooltipComponent>
            )}
        </>
    )
}
