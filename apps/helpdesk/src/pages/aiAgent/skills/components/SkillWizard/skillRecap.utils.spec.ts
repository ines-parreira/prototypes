import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useSkillWizard'

import {
    getApprovedSkillIds,
    getEnabledSkills,
    getGuidanceDisableEntries,
    getGuidanceIdsToDisable,
    getSkillToggleStates,
} from './skillRecap.utils'
import { SkillWizardSkillStatus, SkillWizardStatus } from './skillWizard.mock'

const buildWizard = (
    overrides: Partial<EnrichedSkillWizard> = {},
): EnrichedSkillWizard => {
    const skill = (id: number, title: string, guidance_ids: number[]) => ({
        skill_id: id,
        article: {
            id,
            translation: { title, content: '', intents: [] },
        },
        guidance_ids,
        recommendation: '',
        estimated_automation_rate_impact: '+1%',
        action_configuration_ids: [],
    })

    const reviewable_skills = [
        skill(1, 'Returns and exchanges', [101, 102]),
        skill(2, 'Order status', [201, 102]),
        skill(3, 'Promo codes', [301]),
    ] as unknown as EnrichedSkillWizard['reviewable_skills']

    return {
        id: 1,
        account_id: 1,
        shop_integration_id: 1,
        help_center_id: 1,
        gaia_payload: { recommendations: [] },
        state: {
            skills_configuration: [
                { id: 1, status: SkillWizardSkillStatus.Approved },
                { id: 2, status: SkillWizardSkillStatus.Approved },
                { id: 3, status: SkillWizardSkillStatus.Draft },
            ],
        },
        status: SkillWizardStatus.InProgress,
        started_datetime: null,
        completed_datetime: null,
        last_nudge_sent_datetime: null,
        created_datetime: '',
        updated_datetime: '',
        all_skills: reviewable_skills,
        reviewable_skills,
        ui_wizard_state: { total_count: 3, current_step: 1 },
        ...overrides,
    }
}

describe('skillRecap.utils', () => {
    describe('getApprovedSkillIds', () => {
        it('returns only approved reviewable skills', () => {
            const wizard = buildWizard()
            expect(Array.from(getApprovedSkillIds(wizard))).toEqual([1, 2])
        })

        it('ignores approved skills that are not reviewable', () => {
            const wizard = buildWizard({
                state: {
                    skills_configuration: [
                        { id: 1, status: SkillWizardSkillStatus.Approved },
                        { id: 999, status: SkillWizardSkillStatus.Approved },
                    ],
                },
            })
            expect(Array.from(getApprovedSkillIds(wizard))).toEqual([1])
        })
    })

    describe('getSkillToggleStates', () => {
        it('only returns skills approved by the merchant, defaulting their toggle to enabled', () => {
            const wizard = buildWizard()
            const states = getSkillToggleStates(wizard, new Map())
            expect(states.map((s) => [s.skill.skill_id, s.isEnabled])).toEqual([
                [1, true],
                [2, true],
            ])
        })

        it('lets overrides flip the resolved enabled flag', () => {
            const wizard = buildWizard()
            const states = getSkillToggleStates(wizard, new Map([[1, false]]))
            expect(states.map((s) => [s.skill.skill_id, s.isEnabled])).toEqual([
                [1, false],
                [2, true],
            ])
        })

        it('does not include skills the merchant kept as drafts even if an override flips them on', () => {
            const wizard = buildWizard()
            const states = getSkillToggleStates(wizard, new Map([[3, true]]))
            // skill 3 is in skills_configuration as Draft — it stays out of
            // the sidepanel regardless of override state.
            expect(states.map((s) => s.skill.skill_id)).toEqual([1, 2])
        })
    })

    describe('getEnabledSkills', () => {
        it('returns only the enabled skills', () => {
            const wizard = buildWizard()
            const enabled = getEnabledSkills(wizard, new Map([[2, false]]))
            expect(enabled.map((s) => s.skill_id)).toEqual([1])
        })
    })

    describe('getGuidanceDisableEntries', () => {
        it('builds one entry per unique guidance_id covered by an enabled skill', () => {
            const wizard = buildWizard()
            const entries = getGuidanceDisableEntries(
                wizard,
                new Map(),
                new Map(),
            )
            const ids = entries.map((e) => e.guidanceId).sort((a, b) => a - b)
            // skill 1: 101, 102; skill 2: 201, 102; skill 3 not approved => no 301
            expect(ids).toEqual([101, 102, 201])
        })

        it('lists every covering skill title for shared guidance', () => {
            const wizard = buildWizard()
            const entries = getGuidanceDisableEntries(
                wizard,
                new Map(),
                new Map(),
            )
            const shared = entries.find((e) => e.guidanceId === 102)
            expect(shared?.coveringSkillTitles).toEqual([
                'Returns and exchanges',
                'Order status',
            ])
        })

        it('drops guidance when its only covering skill is toggled off', () => {
            const wizard = buildWizard()
            const entries = getGuidanceDisableEntries(
                wizard,
                new Map([[2, false]]),
                new Map(),
            )
            const ids = entries.map((e) => e.guidanceId).sort((a, b) => a - b)
            // skill 2 off => 201 disappears, 102 still covered by skill 1
            expect(ids).toEqual([101, 102])
        })

        it('reflects merchant override on the to-disable flag', () => {
            const wizard = buildWizard()
            const entries = getGuidanceDisableEntries(
                wizard,
                new Map(),
                new Map([[101, false]]),
            )
            const entry = entries.find((e) => e.guidanceId === 101)
            expect(entry?.isMarkedForDisable).toBe(false)
        })
    })

    describe('getGuidanceIdsToDisable', () => {
        it('returns guidance ids the merchant has not unchecked', () => {
            const wizard = buildWizard()
            const ids = getGuidanceIdsToDisable(
                wizard,
                new Map(),
                new Map([[101, false]]),
            )
            expect(ids.sort((a, b) => a - b)).toEqual([102, 201])
        })
    })
})
