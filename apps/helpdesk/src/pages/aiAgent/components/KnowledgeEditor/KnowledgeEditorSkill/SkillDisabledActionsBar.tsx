import { useShallow } from 'zustand/react/shallow'

import { useActionsInContentNeedingSetup } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/useActionsInContentNeedingSetup'
import { DisabledActionsBar } from 'pages/aiAgent/components/KnowledgeEditor/shared/DisabledActionsBar'

import { useSkillEditorStore } from './context'

export const SkillDisabledActionsBar = () => {
    const { content, shopName, shopType } = useSkillEditorStore(
        useShallow((storeState) => ({
            content: storeState.state.content,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
        })),
    )

    const actionsNeedingSetup = useActionsInContentNeedingSetup(
        content,
        shopName,
        shopType,
    )

    return (
        <DisabledActionsBar
            actionsNeedingSetup={actionsNeedingSetup}
            shopName={shopName}
            type="skill"
        />
    )
}
