import classNames from 'classnames'
import React, {RefObject} from 'react'

import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {App, ActionTemplate} from 'pages/automate/actionsPlatform/types'
import ReusableLLMPromptCallNodeStatusLabel from 'pages/automate/workflows/components/ReusableLLMPromptCallNodeStatusLabel'
import ReusableLLMPromptCallNodeLabel from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptCallNodeLabel'
import {VisualBuilderGraphApp} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import IconButton from 'pages/common/components/button/IconButton'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'

import {getCredentialsStatus} from '../utils'
import css from './StepListItem.less'

interface StepListItemProps {
    isTemplate: boolean
    index: number
    nodeValues: Record<string, string | number | boolean>
    graphApps: VisualBuilderGraphApp[]
    apps: App[]
    step: ActionTemplate
    onDelete: () => void
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    onClick: () => void
}

export const StepListItem: React.FC<StepListItemProps> = ({
    index,
    isTemplate,
    nodeValues,
    graphApps,
    apps,
    step,
    onDelete,
    onMove,
    onDrop,
    onCancel,
    onClick,
}) => {
    const type = `steps`
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {type, position: index},
        [type],
        {onHover: onMove, onDrop, onCancel}
    )

    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})

    if (!step) return null

    const templateApp = step.apps[0]
    const app = getAppFromTemplateApp(templateApp)
    const hasInputs = !!step.inputs?.length
    const hasMissingValues =
        hasInputs &&
        (step.inputs?.length ?? 0) !== Object.keys(nodeValues).length
    const hasAllValues =
        hasInputs &&
        (step.inputs?.length ?? 0) === Object.keys(nodeValues).length

    const graphApp = graphApps.find((app) => {
        switch (templateApp.type) {
            case 'shopify':
            case 'recharge':
                return app.type === templateApp.type
            case 'app':
                return app.type === 'app' && app.app_id === templateApp.app_id
        }
    })

    const {hasMissingCredentials, hasCredentials} = getCredentialsStatus(
        graphApp,
        templateApp,
        isTemplate
    )
    const isClickable = (templateApp.type === 'app' && !isTemplate) || hasInputs

    if (!app) return null
    return (
        <div
            onClick={isClickable ? onClick : undefined}
            style={{cursor: isClickable ? 'pointer' : 'default'}}
            className={css.wrapper}
        >
            <div
                data-handler-id={handlerId}
                ref={dropRef as RefObject<HTMLDivElement>}
                style={{opacity: isDragging ? 0 : 1}}
                className={css.container}
            >
                <li className={css.stepListItem}>
                    <i
                        className={classNames('material-icons', css.dragIcon)}
                        ref={dragRef as RefObject<HTMLButtonElement>}
                    >
                        drag_indicator
                    </i>

                    <div className={css.stepListItemContent}>
                        <ReusableLLMPromptCallNodeLabel
                            app={app}
                            name={step.name}
                            center={true}
                        />
                    </div>

                    <div className={css.stepListItemButtons}>
                        <ReusableLLMPromptCallNodeStatusLabel
                            hasMissingCredentials={hasMissingCredentials}
                            hasCredentials={hasCredentials}
                            hasAllValues={hasAllValues}
                            hasMissingValues={hasMissingValues}
                        />
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            onClick={() => onDelete?.()}
                        >
                            close
                        </IconButton>
                    </div>
                </li>
            </div>
        </div>
    )
}
