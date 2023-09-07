import React from 'react'
import {useParams} from 'react-router-dom'

import {Config, Panel, Panels} from 'panels'

type Params = {
    viewId: string
}

export default function View() {
    const {viewId} = useParams<Params>()

    const panelsConfig: Config = [
        [200, 200, 350],
        [300, 300, 450],
        [Infinity, 100, Infinity],
    ]

    return (
        <Panels config={panelsConfig}>
            <Panel>
                <p>navbar</p>
            </Panel>
            <Panel>
                <p>view {viewId}</p>
            </Panel>
            <Panel>
                <p>ticket</p>
            </Panel>
        </Panels>
    )
}
