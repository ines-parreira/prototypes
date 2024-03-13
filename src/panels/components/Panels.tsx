import React, {Children, cloneElement, Fragment, ReactElement} from 'react'
import _isEqual from 'lodash/isEqual'

import usePrevious from 'hooks/usePrevious'
import useUpdateEffect from 'hooks/useUpdateEffect'

import {usePanels, useScreenSize} from '../hooks'
import type {Config} from '../types'

import Handle from './Handle'
import css from './Panels.less'

type Props = {
    children: ReactElement | ReactElement[]
    config: Config
    fallbackComponent?: ReactElement
    fallbackWidth?: number
    onResize?: (widths: number[]) => void
}

export default function Panels({
    children,
    config,
    fallbackComponent,
    fallbackWidth,
    onResize,
}: Props) {
    const [screenWidth] = useScreenSize()
    const {panelWidths, resizeStartHandlers} = usePanels(config)
    const previousPanelWidths = usePrevious(panelWidths)

    useUpdateEffect(() => {
        if (!_isEqual(panelWidths, previousPanelWidths)) {
            onResize?.(panelWidths)
        }
    }, [panelWidths, previousPanelWidths, onResize])

    if (fallbackWidth && fallbackComponent && screenWidth < fallbackWidth) {
        return fallbackComponent
    }

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
