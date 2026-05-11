import type {
    EnrichedSkillWizard,
    WizardSkill,
} from 'pages/aiAgent/skills/hooks/useSkillWizard'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { getDisabledActionIds } from './skillReviewValidation.utils'
import { SkillWizardSkillStatus } from './skillWizard.mock'

export type SkillToggleState = {
    skill: WizardSkill
    isEnabled: boolean
    disabledActionIds: string[]
}

export type GuidanceDisableEntry = {
    guidanceId: number
    coveringSkillTitles: string[]
    isMarkedForDisable: boolean
}

const getSkillTitle = (skill: WizardSkill): string =>
    skill.article?.translation.title ?? `Skill ${skill.skill_id}`

/**
 * Skills the merchant has approved on the backend (status === Approved in
 * skills_configuration), filtered to skills that are still reviewable.
 */
export const getApprovedSkillIds = (
    wizard: EnrichedSkillWizard,
): Set<number> => {
    const reviewableIds = new Set(
        wizard.reviewable_skills.map((s) => s.skill_id),
    )
    const approved = new Set<number>()
    for (const config of wizard.state.skills_configuration ?? []) {
        if (
            config.status === SkillWizardSkillStatus.Approved &&
            reviewableIds.has(config.id)
        ) {
            approved.add(config.id)
        }
    }
    return approved
}

/**
 * Resolve enabled state per skill given the merchant's recap-local toggle
 * overrides. Falls back to the persisted approved status.
 *
 * Only skills the merchant approved during review (skills_configuration
 * status === Approved) are returned — skills they kept as drafts are not
 * surfaced in the sidepanel because the merchant cannot enable them from
 * here.
 */
export const getSkillToggleStates = (
    wizard: EnrichedSkillWizard,
    overrides: ReadonlyMap<number, boolean>,
    availableActions: GuidanceAction[] = [],
): SkillToggleState[] => {
    const approved = getApprovedSkillIds(wizard)
    return wizard.reviewable_skills
        .filter((skill) => approved.has(skill.skill_id))
        .map((skill) => ({
            skill,
            isEnabled: overrides.has(skill.skill_id)
                ? !!overrides.get(skill.skill_id)
                : true,
            disabledActionIds: getDisabledActionIds(
                skill.article?.translation.content ?? '',
                availableActions,
            ),
        }))
}

export const getEnabledSkills = (
    wizard: EnrichedSkillWizard,
    overrides: ReadonlyMap<number, boolean>,
): WizardSkill[] =>
    getSkillToggleStates(wizard, overrides)
        .filter((entry) => entry.isEnabled)
        .map((entry) => entry.skill)

/**
 * Build the guidance rows shown in the guidance sidepanel — one entry per
 * unique guidance_id covered by any enabled skill, defaulting to "marked for
 * disable" unless the merchant has explicitly unchecked it.
 */
export const getGuidanceDisableEntries = (
    wizard: EnrichedSkillWizard,
    skillOverrides: ReadonlyMap<number, boolean>,
    guidanceOverrides: ReadonlyMap<number, boolean>,
): GuidanceDisableEntry[] => {
    const enabledSkills = getEnabledSkills(wizard, skillOverrides)
    const coveredBy = new Map<number, string[]>()

    for (const skill of enabledSkills) {
        const title = getSkillTitle(skill)
        for (const guidanceId of skill.guidance_ids) {
            const titles = coveredBy.get(guidanceId) ?? []
            if (!titles.includes(title)) titles.push(title)
            coveredBy.set(guidanceId, titles)
        }
    }

    return Array.from(coveredBy.entries()).map(([guidanceId, titles]) => ({
        guidanceId,
        coveringSkillTitles: titles,
        isMarkedForDisable: guidanceOverrides.get(guidanceId) ?? true,
    }))
}

export const getGuidanceIdsToDisable = (
    wizard: EnrichedSkillWizard,
    skillOverrides: ReadonlyMap<number, boolean>,
    guidanceOverrides: ReadonlyMap<number, boolean>,
): number[] =>
    getGuidanceDisableEntries(wizard, skillOverrides, guidanceOverrides)
        .filter((entry) => entry.isMarkedForDisable)
        .map((entry) => entry.guidanceId)
