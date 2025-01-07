import React, {Dispatch, useState} from 'react'

import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {VisualBuilderGraphAction} from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Button from 'pages/common/components/button/Button'

import {ConvertActionToAdvancedViewDialog} from './ConvertActionToAdvancedViewDialog'
import css from './SimplifiedStepBuilder.less'
import {SimplifiedStepBuilderSteps} from './SimplifiedStepBuilderSteps'

type Props = {
    graph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
    steps: ActionTemplate[]
}

export const SimplifiedStepBuilder = ({graph, dispatch, steps}: Props) => {
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false)

    return (
        <>
            <div>
                <SimplifiedStepBuilderSteps
                    graph={graph}
                    dispatch={dispatch}
                    steps={steps}
                />
                <div className={css.caption}>Don't see the app you need?</div>
                <div className={css.buttons}>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        size="small"
                        className={css.button}
                        leadingIcon="add_box"
                        data-candu-id="step-builder-request-app-button"
                    >
                        Request an app
                    </Button>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        size="small"
                        className={css.button}
                        onClick={() => setIsAdvancedModalOpen(true)}
                        leadingIcon="settings"
                    >
                        Advanced options
                    </Button>
                </div>
            </div>
            <ConvertActionToAdvancedViewDialog
                open={isAdvancedModalOpen}
                onClose={() => setIsAdvancedModalOpen(false)}
                onConvert={() => {
                    dispatch({
                        type: 'MIGRATE_TO_ADVANCED_STEP_BUILDER',
                    })
                    setIsAdvancedModalOpen(false)
                }}
            />
        </>
    )
}
