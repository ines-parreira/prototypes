import React, { Dispatch, useState } from 'react'

import { Button } from '@gorgias/axiom'

import { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { VisualBuilderGraphAction } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import StoreAppsProvider from '../providers/StoreAppsProvider'
import { ConvertActionToAdvancedViewDialog } from './ConvertActionToAdvancedViewDialog'
import { SimplifiedStepBuilderSteps } from './SimplifiedStepBuilderSteps'

import css from './SimplifiedStepBuilder.less'

type Props = {
    graph: VisualBuilderGraph
    dispatch: Dispatch<VisualBuilderGraphAction>
    steps: ActionTemplate[]
    shopName: string
    shopType: string
}

export const SimplifiedStepBuilder = ({
    graph,
    dispatch,
    steps,
    shopName,
    shopType,
}: Props) => {
    const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false)

    return (
        <StoreAppsProvider
            storeName={shopName}
            storeType={shopType as 'shopify'}
        >
            <div>
                <SimplifiedStepBuilderSteps
                    graph={graph}
                    dispatch={dispatch}
                    steps={steps}
                />
                <div className={css.caption}>
                    {`Don't see the app you need?`}
                </div>
                <div className={css.buttons}>
                    <Button
                        fillStyle="ghost"
                        intent="primary"
                        size="small"
                        className={css.button}
                        leadingIcon="add_box"
                    >
                        <a
                            target="_blank"
                            href="https://link.gorgias.com/actions"
                            rel="noreferrer"
                        >
                            Request an app
                        </a>
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
        </StoreAppsProvider>
    )
}
