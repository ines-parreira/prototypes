import {Macro} from '@gorgias/api-queries'
import React from 'react'

import Preview from '../Preview'

const MacroPreview = ({currentMacro}: {currentMacro?: Macro}) =>
    currentMacro ? (
        <div className="MacroPreview">
            <div className="mt-3 mb-3">
                <h2>{currentMacro.name || ''}</h2>

                <Preview displayHTML={true} actions={currentMacro.actions} />
            </div>
        </div>
    ) : (
        <div className="MacroPreview">
            <div className="no-result-container">
                <p>
                    You don't have any macro you can apply on a batch of
                    tickets.
                </p>
            </div>
        </div>
    )

export default MacroPreview
