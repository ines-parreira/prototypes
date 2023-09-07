import React, {Children, cloneElement, Fragment, ReactElement} from 'react'

import {usePanels} from '../hooks'
import type {Config} from '../types'

import Handle from './Handle'
import css from './Panels.less'

type Props = {
    children: ReactElement | ReactElement[]
    config: Config
}

export default function Panels({children, config}: Props) {
    const {panelWidths, resizeStartHandlers} = usePanels(config)

    return (
        <div className={css.panels}>
            {Children.map(children, (child, index) => (
                <Fragment>
                    {index > 0 && (
                        <Handle
                            onResizeStart={resizeStartHandlers[index - 1]}
                        />
                    )}
                    {cloneElement(child, {width: panelWidths[index]})}
                </Fragment>
            ))}
        </div>
    )
}
