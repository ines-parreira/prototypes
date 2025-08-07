import React from 'react'

import { Panel } from 'reactflow'

import { CustomFitViewControl } from './CustomFitViewControl'
import { CustomZoomDropdownControl } from './CustomZoomDropdownControl'
import { CustomZoomInControl } from './CustomZoomInControl'
import { CustomZoomOutControl } from './CustomZoomOutControl'

import css from './CustomControls.less'

export function CustomControls(): React.JSX.Element {
    return (
        <Panel position="top-left">
            <div className={css.container}>
                <CustomZoomInControl />
                <CustomZoomOutControl />
                <CustomZoomDropdownControl />
                <CustomFitViewControl />
            </div>
        </Panel>
    )
}
