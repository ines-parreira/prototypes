import {VisualBuilderGraphApp} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import {ActionsApp, ActionTemplateApp} from './types'

export const getGraphAppFromTemplateApp = (
    graphApps: VisualBuilderGraphApp[],
    templateApp: ActionTemplateApp
): VisualBuilderGraphApp | undefined => {
    return graphApps.find((graphApp) => {
        switch (templateApp.type) {
            case 'shopify':
            case 'recharge':
                return graphApp.type === templateApp.type
            case 'app':
                return (
                    graphApp.type === 'app' &&
                    graphApp.app_id === templateApp.app_id
                )
        }
    })
}

export const getActionsAppFromTemplateApp = (
    actionsApps: ActionsApp[],
    templateApp: ActionTemplateApp
): ActionsApp | undefined => {
    if (templateApp.type !== 'app') {
        return
    }

    return actionsApps.find(
        (actionsApp) => actionsApp.id === templateApp.app_id
    )
}
