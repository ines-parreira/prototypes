import React, {
    Children,
    cloneElement,
    Fragment,
    ReactElement,
    useEffect,
} from 'react'
import _isEqual from 'lodash/isEqual'

import usePrevious from 'hooks/usePrevious'
import {usePanels} from '../hooks'
import type {Config} from '../types'

import Handle from './Handle'
import css from './Panels.less'

type Props = {
    children: ReactElement | ReactElement[]
    config: Config
    onResize?: (widths: number[]) => void
}

export default function Panels({children, config, onResize}: Props) {
    const {panelWidths, resizeStartHandlers} = usePanels(config)
    const previousPanelWidths = usePrevious(panelWidths)

    useEffect(() => {
        if (!_isEqual(panelWidths, previousPanelWidths)) {
            onResize?.(panelWidths)
        }
    }, [panelWidths, previousPanelWidths, onResize])

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
