import { useCallback, useMemo, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import {
    Box,
    Button,
    Card,
    Dot,
    Heading,
    Icon,
    Tag,
    Text,
    toast,
} from '@gorgias/axiom'

import { useGetHelpCenter } from 'models/helpCenter/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useApplyWizardChanges } from 'pages/aiAgent/skills/hooks/useApplyWizardChanges'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useSkillWizardMutations } from 'pages/aiAgent/skills/hooks/useSkillWizardMutations'
import type { Paths as WorkflowsPaths } from 'rest_api/workflows_api/client.generated'

import { GuidanceSidePanel } from './GuidanceSidePanel'
import {
    getApprovedSkillIds,
    getEnabledSkills,
    getGuidanceDisableEntries,
    getSkillToggleStates,
} from './skillRecap.utils'
import { SkillRecapApplyLoading } from './SkillRecapApplyLoading'
import { SkillRecapApplySuccess } from './SkillRecapApplySuccess'
import { SkillsSidePanel } from './SkillsSidePanel'
import { useSkillWizardContext } from './SkillWizardContext'
import { useRecapGuidances } from './useRecapGuidances'

import css from './SkillRecapStep.less'

type StoreType =
    WorkflowsPaths.StoreWfConfigurationControllerUpsert.Parameters.StoreType

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
    const [isCompletingWizard, setIsCompletingWizard] = useState(false)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const storeName = storeConfiguration?.storeName ?? ''
    const shopType = storeConfiguration?.shopType ?? ''
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0

    const { guidanceActions, rawActions } = useGetGuidancesAvailableActions(
        storeName,
        shopType,
    )

    const { data: helpCenter } = useGetHelpCenter(
        helpCenterId,
        {},
        { enabled: !!helpCenterId },
    )

    const history = useHistory()
    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const { complete } = useSkillWizardMutations(helpCenterId)

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

    const hasEnabledSkills = enabledSkillsCount > 0

    const { apply, phase, liveSkillsCount } = useApplyWizardChanges({
        wizard,
        skillOverrides,
        guidanceOverrides,
        guidanceActions,
        rawActions,
        helpCenterId,
        storeName,
        storeType: shopType as StoreType,
        localeCode: helpCenter?.default_locale,
    })

    const handleApplyChanges = useCallback(() => {
        void complete()
        apply()
    }, [complete, apply])

    const handleContinueToSkills = useCallback(async () => {
        setIsCompletingWizard(true)
        try {
            await complete()
            history.push(routes.skills)
        } catch {
            toast.error("Couldn't complete the wizard. Please try again.")
        } finally {
            setIsCompletingWizard(false)
        }
    }, [complete, history, routes.skills])

    const hasApprovedSkills = useMemo(
        () => getApprovedSkillIds(wizard).size > 0,
        [wizard],
    )

    const hasEnabledSkillsWithActions = useMemo(
        () =>
            skillStates.some(
                (state) =>
                    state.isEnabled && state.disabledActionIds.length > 0,
            ),
        [skillStates],
    )

    const hasGuidancesToDisable = hasEnabledSkills && guidanceEntries.length > 0

    const guidanceCardTitle = hasGuidancesToDisable
        ? 'Some of your guidance can now be disabled'
        : 'All of your enabled guidance will remain active'
    const guidanceCardDescription = hasGuidancesToDisable
        ? 'Fully covered by these skills'
        : 'Nothing in your current setup will change'

    if (phase === 'enabling-skills') {
        return <SkillRecapApplyLoading message="Enabling your skills..." />
    }

    if (phase === 'disabling-guidances') {
        return <SkillRecapApplyLoading message="Disabling guidance..." />
    }

    if (phase === 'success') {
        return <SkillRecapApplySuccess liveSkillsCount={liveSkillsCount} />
    }

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
                        <Box gap="xs" alignItems="center">
                            {hasEnabledSkillsWithActions && (
                                <Tag
                                    color="orange"
                                    leadingSlot={<Dot color="orange" />}
                                >
                                    Review actions
                                </Tag>
                            )}
                            {hasApprovedSkills && (
                                <Icon
                                    name="arrow-chevron-right"
                                    size="md"
                                    color="var(--content-neutral-default)"
                                />
                            )}
                        </Box>
                    </Card>

                    <Card
                        elevation="mid"
                        onClick={
                            hasGuidancesToDisable
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
                        {hasGuidancesToDisable && (
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
                        isLoading={isCompletingWizard}
                        isDisabled={
                            hasEnabledSkills && !helpCenter?.default_locale
                        }
                        onClick={
                            hasEnabledSkills
                                ? handleApplyChanges
                                : handleContinueToSkills
                        }
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
                actionsUrl={routes.actions}
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
