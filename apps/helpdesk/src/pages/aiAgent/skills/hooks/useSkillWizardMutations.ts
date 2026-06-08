import { useCallback, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useDebouncedCallback } from '@repo/hooks'
import {
    useIsMutating,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'

import { helpCenterKeys, usePatchWizard } from 'models/helpCenter/queries'
import { updateArticleTranslation } from 'models/helpCenter/resources'
import type {
    SkillWizardData,
    SkillWizardSkillStatus,
    SkillWizardStep,
} from 'pages/aiAgent/skills/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Components } from 'rest_api/help_center_api/client.generated'

export const SKILL_WIZARD_SAVING_MUTATION_KEY = ['skill-wizard-saving'] as const

type PatchSkillWizardDto = Components.Schemas.PatchSkillWizardDto

type StepLocation = {
    current_step: SkillWizardStep
    current_skill_id?: number
}

type SaveInstructionsArgs = {
    articleId: number
    locale: string
    content: string
    draftSkillIdAfterSave?: number
}

type SkillStatusArgs = {
    skillId: number
    status: SkillWizardSkillStatus
}

type WizardMutationContext = {
    previous: SkillWizardData | null | undefined
}

type SkillsConfiguration = NonNullable<
    PatchSkillWizardDto['skills_configuration']
>

const mergeSkillsConfiguration = (
    current: SkillsConfiguration | undefined,
    changes: SkillsConfiguration,
): SkillsConfiguration => {
    let next: SkillsConfiguration = current ?? []
    for (const item of changes) {
        const idx = next.findIndex((c) => c.id === item.id)
        next =
            idx >= 0
                ? next.map((c, i) => (i === idx ? { ...c, ...item } : c))
                : [...next, item]
    }
    return next
}

const applyWizardPatch = (
    wizard: SkillWizardData,
    patch: PatchSkillWizardDto,
): SkillWizardData => {
    const next: SkillWizardData = { ...wizard }

    if (patch.status) {
        next.status = patch.status
    }

    const stateChanged =
        patch.current_step !== undefined ||
        'current_skill_id' in patch ||
        patch.skills_configuration !== undefined

    if (stateChanged) {
        const nextConfig = patch.skills_configuration
            ? mergeSkillsConfiguration(
                  wizard.state.skills_configuration ?? undefined,
                  patch.skills_configuration,
              )
            : (wizard.state.skills_configuration ?? [])
        next.state = {
            ...wizard.state,
            ...(patch.current_step !== undefined
                ? { current_step: patch.current_step }
                : {}),
            ...('current_skill_id' in patch
                ? { current_skill_id: patch.current_skill_id }
                : {}),
            skills_configuration: nextConfig,
        }
    }

    return next
}

export const useSkillWizardMutations = (helpCenterId: number) => {
    const queryClient = useQueryClient()
    const { client: helpCenterClient } = useHelpCenterApi()
    const wizardQueryKey = helpCenterKeys.wizard(helpCenterId)
    const articleListKeyPrefix = helpCenterKeys.detail(helpCenterId)

    const { mutate: patchWizardMutate, mutateAsync: patchWizardMutateAsync } =
        usePatchWizard({
            mutationKey: SKILL_WIZARD_SAVING_MUTATION_KEY,
            onMutate: async ([, , data]) => {
                await queryClient.cancelQueries({ queryKey: wizardQueryKey })
                const previous =
                    queryClient.getQueryData<SkillWizardData | null>(
                        wizardQueryKey,
                    )
                if (previous) {
                    queryClient.setQueryData<SkillWizardData | null>(
                        wizardQueryKey,
                        applyWizardPatch(previous, data),
                    )
                }
                return { previous } as WizardMutationContext
            },
            onError: (_error, _variables, context) => {
                const ctx = context as WizardMutationContext | undefined
                if (ctx?.previous !== undefined) {
                    queryClient.setQueryData(wizardQueryKey, ctx.previous)
                }
            },
            onSuccess: (data) => {
                if (data) {
                    queryClient.setQueryData<SkillWizardData | null>(
                        wizardQueryKey,
                        data,
                    )
                }
            },
        })

    const patch = useCallback(
        (data: PatchSkillWizardDto) => {
            patchWizardMutate([
                helpCenterClient,
                { help_center_id: helpCenterId },
                data,
            ])
        },
        [patchWizardMutate, helpCenterClient, helpCenterId],
    )

    const start = useCallback(() => {
        patch({ status: 'in_progress' })
    }, [patch])

    const setStepLocation = useCallback(
        ({ current_step, current_skill_id }: StepLocation) => {
            patch({ current_step, current_skill_id })
        },
        [patch],
    )

    const mergeWithCurrent = useCallback(
        (changes: SkillsConfiguration): SkillsConfiguration => {
            const current = queryClient.getQueryData<SkillWizardData | null>(
                wizardQueryKey,
            )
            return mergeSkillsConfiguration(
                current?.state.skills_configuration ?? undefined,
                changes,
            )
        },
        [queryClient, wizardQueryKey],
    )

    const setSkillStatus = useCallback(
        ({ skillId, status }: SkillStatusArgs) => {
            patch({
                skills_configuration: mergeWithCurrent([
                    { id: skillId, status },
                ]),
            })
        },
        [patch, mergeWithCurrent],
    )

    const ensureSkillStatus = useCallback(
        ({ skillId, status }: SkillStatusArgs) => {
            const current = queryClient.getQueryData<SkillWizardData | null>(
                wizardQueryKey,
            )
            const alreadyConfigured =
                current?.state.skills_configuration?.some(
                    (c) => c.id === skillId,
                ) ?? false
            if (alreadyConfigured) return
            patch({
                skills_configuration: mergeWithCurrent([
                    { id: skillId, status },
                ]),
            })
        },
        [patch, mergeWithCurrent, queryClient, wizardQueryKey],
    )

    const complete = useCallback(
        () =>
            patchWizardMutateAsync([
                helpCenterClient,
                { help_center_id: helpCenterId },
                { status: 'completed' },
            ]),
        [patchWizardMutateAsync, helpCenterClient, helpCenterId],
    )

    const { mutateAsync: saveInstructionsMutateAsync } = useMutation({
        mutationKey: SKILL_WIZARD_SAVING_MUTATION_KEY,
        mutationFn: ({ articleId, locale, content }: SaveInstructionsArgs) =>
            updateArticleTranslation(
                helpCenterClient,
                {
                    help_center_id: helpCenterId,
                    article_id: articleId,
                    locale,
                },
                { content, is_current: false },
            ),
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: [...articleListKeyPrefix, 'articles'],
            })
        },
    })

    const [hasPendingInstructionsSave, setHasPendingInstructionsSave] =
        useState(false)

    const flushInstructions = useDebouncedCallback(
        async (args: SaveInstructionsArgs) => {
            try {
                await saveInstructionsMutateAsync(args)
                if (args.draftSkillIdAfterSave !== undefined) {
                    patch({
                        skills_configuration: mergeWithCurrent([
                            {
                                id: args.draftSkillIdAfterSave,
                                status: 'draft',
                            },
                        ]),
                    })
                }
            } finally {
                setHasPendingInstructionsSave(false)
            }
        },
        Duration.millis(500),
    )

    const saveInstructions = useCallback(
        (args: SaveInstructionsArgs) => {
            setHasPendingInstructionsSave(true)
            flushInstructions(args)
        },
        [flushInstructions],
    )

    const isMutating =
        useIsMutating({ mutationKey: SKILL_WIZARD_SAVING_MUTATION_KEY }) > 0
    const isSaving = isMutating || hasPendingInstructionsSave

    return {
        start,
        setStepLocation,
        setSkillStatus,
        ensureSkillStatus,
        saveInstructions,
        complete,
        isSaving,
    }
}
