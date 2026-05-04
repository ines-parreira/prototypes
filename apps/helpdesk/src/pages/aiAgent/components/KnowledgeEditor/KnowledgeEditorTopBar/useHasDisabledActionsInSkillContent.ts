import { useShallow } from 'zustand/react/shallow'

import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'

import { useActionsInContentNeedingSetup } from './useActionsInContentNeedingSetup'

export const useHasDisabledActionsInSkillContent = (): boolean => {
    const { content, shopName, shopType } = useSkillEditorStore(
        useShallow((storeState) => ({
            content: storeState.state.content,
            shopName: storeState.config.shopName,
            shopType: storeState.config.shopType,
        })),
    )

    return (
        useActionsInContentNeedingSetup(content, shopName, shopType).length > 0
    )
}
