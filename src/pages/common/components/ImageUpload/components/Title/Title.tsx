import {Tooltip as TooltipComponent} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React, {ReactChild, FunctionComponent, createRef} from 'react'

import {UncontrolledTooltipProps} from 'reactstrap'

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
                            'material-icons-outlined ml-2'
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
