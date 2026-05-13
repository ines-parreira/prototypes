import { useCallback, useMemo, useState } from 'react'

import { Box, Button, Card, Heading, Icon, Text } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'

import { GuidanceSidePanel } from './GuidanceSidePanel'
import {
    getApprovedSkillIds,
    getEnabledSkills,
    getGuidanceDisableEntries,
    getSkillToggleStates,
} from './skillRecap.utils'
import { SkillsSidePanel } from './SkillsSidePanel'
import { useSkillWizardContext } from './SkillWizardContext'
import { useRecapGuidances } from './useRecapGuidances'

import css from './SkillRecapStep.less'

type Props = {
    wizard: EnrichedSkillWizard
}

export const SkillRecapStep = ({ wizard }: Props) => {
    const { goBack } = useSkillWizardContext()

    const [skillOverrides, setSkillOverrides] = useState<Map<number, boolean>>(
        () => new Map(),
    )
    const [guidanceOverrides, setGuidanceOverrides] = useState<
        Map<number, boolean>
    >(() => new Map())

    const [isSkillsPanelOpen, setIsSkillsPanelOpen] = useState(false)
    const [isGuidancePanelOpen, setIsGuidancePanelOpen] = useState(false)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const { guidanceActions } = useGetGuidancesAvailableActions(
        storeConfiguration?.storeName ?? '',
        storeConfiguration?.shopType ?? '',
    )

    const skillStates = useMemo(
        () => getSkillToggleStates(wizard, skillOverrides, guidanceActions),
        [wizard, skillOverrides, guidanceActions],
    )

    const enabledSkillsCount = useMemo(
        () => getEnabledSkills(wizard, skillOverrides).length,
        [wizard, skillOverrides],
    )

    const guidanceEntries = useMemo(
        () =>
            getGuidanceDisableEntries(
                wizard,
                skillOverrides,
                guidanceOverrides,
            ),
        [wizard, skillOverrides, guidanceOverrides],
    )

    const allCandidateGuidanceIds = useMemo(
        () => wizard.reviewable_skills.flatMap((skill) => skill.guidance_ids),
        [wizard.reviewable_skills],
    )

    const { getGuidanceTitle } = useRecapGuidances(allCandidateGuidanceIds)

    const handleToggleSkill = useCallback(
        (skillId: number, isEnabled: boolean) => {
            setSkillOverrides((prev) => {
                const next = new Map(prev)
                next.set(skillId, isEnabled)
                return next
            })
        },
        [],
    )

    const handleToggleGuidance = useCallback(
        (guidanceId: number, isMarkedForDisable: boolean) => {
            setGuidanceOverrides((prev) => {
                const next = new Map(prev)
                next.set(guidanceId, isMarkedForDisable)
                return next
            })
        },
        [],
    )

    const handleApply = useCallback(() => {
        // TODO(rd-816): wire backend mutation with the following payload —
        //   skillsToEnable       = getSkillToggleStates(wizard, skillOverrides, guidanceActions)
        //                            .filter((e) => e.isEnabled).map((e) => e.skill.skill_id)
        //   guidanceIdsToDisable = getGuidanceIdsToDisable(wizard, skillOverrides, guidanceOverrides)
        //   actionIdsToEnable    = the same filtered states, flatMap on disabledActionIds, deduped
    }, [])

    const hasEnabledSkills = enabledSkillsCount > 0

    const hasApprovedSkills = useMemo(
        () => getApprovedSkillIds(wizard).size > 0,
        [wizard],
    )

    const guidanceCardTitle = hasEnabledSkills
        ? 'Some of your guidance can now be disabled'
        : 'All of your enabled guidance will remain active'
    const guidanceCardDescription = hasEnabledSkills
        ? 'Fully covered by these skills'
        : 'Nothing in your current setup will change'

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding="lg"
            height="100%"
        >
            <Box flexDirection="column" gap="md" className={css.content}>
                <Box flexDirection="column" gap="xxxs">
                    <Heading size="lg">Your setup is ready to go live</Heading>
                    <Text>
                        Review what&apos;s about to change, then apply when
                        you&apos;re ready
                    </Text>
                </Box>

                <Box flexDirection="column" gap="xs" width="100%">
                    <Card
                        elevation="mid"
                        onClick={
                            hasApprovedSkills
                                ? () => setIsSkillsPanelOpen(true)
                                : undefined
                        }
                        flexDirection="row"
                        justifyContent="space-between"
                        className={css.skillRecapCards}
                        width="100%"
                    >
                        <Box gap="xs" alignItems="flex-start">
                            <Icon
                                name="check-circle"
                                size="md"
                                color="content-success-default"
                            />
                            <Box flexDirection="column" gap="xxxs">
                                <Text
                                    variant="bold"
                                    color="var(--content-neutral-default)"
                                >
                                    {enabledSkillsCount}{' '}
                                    {enabledSkillsCount === 1
                                        ? 'skill'
                                        : 'skills'}{' '}
                                    ready to enable
                                </Text>
                                <Text color="content-neutral-secondary">
                                    More reliable handling for your top customer
                                    intents
                                </Text>
                            </Box>
                        </Box>
                        {hasApprovedSkills && (
                            <Icon
                                name="arrow-chevron-right"
                                size="md"
                                color="var(--content-neutral-default)"
                            />
                        )}
                    </Card>

                    <Card
                        elevation="mid"
                        onClick={
                            hasEnabledSkills
                                ? () => setIsGuidancePanelOpen(true)
                                : undefined
                        }
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        className={css.skillRecapCards}
                        width="100%"
                    >
                        <Box gap="xs" alignItems="flex-start">
                            <Icon
                                name="check-circle"
                                size="md"
                                color="content-success-default"
                            />
                            <Box flexDirection="column" gap="xxxs">
                                <Text
                                    variant="bold"
                                    color="var(--content-neutral-default)"
                                >
                                    {guidanceCardTitle}
                                </Text>
                                <Text color="content-neutral-secondary">
                                    {guidanceCardDescription}
                                </Text>
                            </Box>
                        </Box>
                        {hasEnabledSkills && (
                            <Icon name="arrow-chevron-right" size="md" />
                        )}
                    </Card>
                </Box>

                <Box gap="xs" width="100%">
                    <Button variant="secondary" onClick={goBack}>
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        leadingSlot={hasEnabledSkills ? 'check' : undefined}
                        trailingSlot={
                            hasEnabledSkills ? undefined : 'arrow-right'
                        }
                        onClick={handleApply}
                    >
                        {hasEnabledSkills
                            ? 'Apply all changes'
                            : 'Continue to skills'}
                    </Button>
                </Box>
            </Box>

            <SkillsSidePanel
                isOpen={isSkillsPanelOpen}
                onOpenChange={setIsSkillsPanelOpen}
                skillStates={skillStates}
                onToggleSkill={handleToggleSkill}
            />

            <GuidanceSidePanel
                isOpen={isGuidancePanelOpen}
                onOpenChange={setIsGuidancePanelOpen}
                entries={guidanceEntries}
                getGuidanceTitle={getGuidanceTitle}
                onToggleGuidance={handleToggleGuidance}
            />
        </Box>
    )
}
