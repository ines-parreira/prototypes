import { useCallback, useMemo, useState } from 'react'

import { Banner, Box, Button, Card } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { WizardSkill } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { SkillWizardSkillStatus } from 'pages/aiAgent/skills/types'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { useGetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'

import { groupActionsByIntegration } from './skillReviewActions.utils'
import { SkillReviewCardBody } from './SkillReviewCardBody'
import { SkillReviewCardHeader } from './SkillReviewCardHeader'
import {
    hasActionRequiringSetup,
    isInstructionsEmpty,
} from './skillReviewValidation.utils'
import { useSkillWizardContext } from './SkillWizardContext'
import { useRecapGuidances } from './useRecapGuidances'
import { WhyWeCreatedThisSkillCard } from './WhyWeCreatedThisSkillCard'

import css from './SkillReviewStep.less'

type Props = {
    skill: WizardSkill
    status: SkillWizardSkillStatus
    onStatusChange: (status: SkillWizardSkillStatus) => void
    onInstructionsChange?: (content: string) => void
}

export const SkillReviewStep = ({
    skill,
    status,
    onStatusChange,
    onInstructionsChange,
}: Props) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const shopName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''

    const routes = useMemo(
        () => getAiAgentNavigationRoutes(shopName),
        [shopName],
    )

    const { guidanceById } = useRecapGuidances(skill.guidance_ids)

    const guidanceSources = useMemo(
        () =>
            skill.guidance_ids.map((id) => ({
                id,
                title: guidanceById.get(id)?.title ?? `Guidance ${id}`,
                url: routes.knowledgeArticle('guidance', id),
            })),
        [skill.guidance_ids, guidanceById, routes],
    )

    const { guidanceActions, rawActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const { apps } = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })

    const [instructionsContent, setInstructionsContent] = useState<string>(
        skill.article?.translation.content ?? '',
    )
    const handleInstructionsChange = useCallback(
        (next: string) => {
            setInstructionsContent(next)
            onInstructionsChange?.(next)
        },
        [onInstructionsChange],
    )

    const actionGroups = useMemo(
        () =>
            groupActionsByIntegration(
                skill.action_configuration_ids,
                rawActions,
                getAppFromTemplateApp,
            ),
        [skill.action_configuration_ids, rawActions, getAppFromTemplateApp],
    )

    const intents = skill.article?.translation.intents ?? []
    const title = skill.article?.translation.title ?? ''

    const instructionsEmpty = isInstructionsEmpty(instructionsContent)
    const actionSetupRequired = hasActionRequiringSetup(
        instructionsContent,
        guidanceActions,
    )
    const isApprovedDisabled = instructionsEmpty || actionSetupRequired

    let approvedDisabledReason: string | undefined
    let bannerTitle: string | undefined

    if (instructionsEmpty) {
        approvedDisabledReason =
            'This skill requires instructions. You can add them later.'
        bannerTitle =
            "We'll save this skill as a draft. You can add instructions later."
    } else if (actionSetupRequired) {
        approvedDisabledReason =
            'This skill has actions that need to be enabled. You can enable them later.'
        bannerTitle =
            "We'll save this skill as a draft. You can set up actions later."
    }

    const { goNext, currentStep, reviewStepsCount } = useSkillWizardContext()
    const isLastReviewStep = currentStep >= reviewStepsCount
    const ctaLabel = isLastReviewStep ? 'Next' : 'Review next skill'

    return (
        <Box flexDirection="column" gap="md" className={css.container}>
            <WhyWeCreatedThisSkillCard
                recommendation={skill.recommendation}
                estimatedImpact={skill.estimated_automation_rate_impact}
                guidanceSources={guidanceSources}
            />
            {bannerTitle && (
                <Banner
                    intent="info"
                    size="md"
                    isClosable={false}
                    title={bannerTitle}
                >
                    <Button
                        variant="primary"
                        size="sm"
                        trailingSlot="arrow-right"
                        onClick={goNext}
                    >
                        {ctaLabel}
                    </Button>
                </Banner>
            )}
            <Card elevation="mid" flexDirection="column" gap="xxs" width="100%">
                <SkillReviewCardHeader
                    title={title}
                    status={status}
                    onStatusChange={onStatusChange}
                    isApprovedDisabled={isApprovedDisabled}
                    approvedDisabledReason={approvedDisabledReason}
                />
                <SkillReviewCardBody
                    intents={intents}
                    actionGroups={actionGroups}
                    instructionsContent={instructionsContent}
                    shopName={shopName}
                    availableActions={guidanceActions}
                    onInstructionsChange={handleInstructionsChange}
                    onKeepAsDraft={() =>
                        onStatusChange(SkillWizardSkillStatus.Draft)
                    }
                />
            </Card>
        </Box>
    )
}
