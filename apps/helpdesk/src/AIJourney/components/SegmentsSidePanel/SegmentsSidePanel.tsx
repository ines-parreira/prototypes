import { useCallback, useEffect, useMemo } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'

import {
    Box,
    Button,
    Heading,
    Icon,
    PanelHeader,
    SidePanel,
    SidePanelSize,
    Size,
    TextField,
} from '@gorgias/axiom'

import { AudienceConditionField } from 'AIJourney/components/AudienceConditionField/AudienceConditionField'
import { SegmentCountPreview } from 'AIJourney/components/SegmentCountPreview/SegmentCountPreview'
import { SegmentUsageTable } from 'AIJourney/components/SegmentUsageTable/SegmentUsageTable'
import { useSegmentsUsage } from 'AIJourney/hooks/useSegmentsUsage/useSegmentsUsage'
import type { Segment } from 'AIJourney/pages/Segments/Segments'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateSegment } from 'AIJourney/queries'
import { useAudienceCount } from 'AIJourney/queries/useAudienceCount/useAudienceCount'
import { useUpdateSegment } from 'AIJourney/queries/useUpdateSegment/useUpdateSegment'
import type {
    ConditionsSchema,
    ConditionState,
} from 'AIJourney/types/conditionField'
import { DEFAULT_CONDITION } from 'AIJourney/types/conditionField'
import { isExistenceCondition } from 'AIJourney/utils/conditionField/conditionField'
import {
    buildFullQuery,
    parseConditionsQuery,
} from 'AIJourney/utils/conditionQueryBuilder/conditionQueryBuilder'

type SegmentFormValues = {
    name: string
    conditions: ConditionState[]
}

export const SegmentsSidePanel = ({
    isOpen,
    onClose,
    segment,
    schema,
    onSegmentCreated,
}: {
    isOpen: boolean
    onClose: () => void
    segment?: Segment
    schema: ConditionsSchema
    onSegmentCreated?: (segment: { id: string; name: string }) => void
}) => {
    const { currentIntegration } = useJourneyContext()
    const { mutateAsync: createSegment, isLoading: isCreatingSegment } =
        useCreateSegment()

    const form = useForm<SegmentFormValues>({
        defaultValues: {
            name: segment?.name ?? '',
            conditions: [DEFAULT_CONDITION],
        },
    })

    const { mutateAsync: updateSegment, isLoading: isUpdatingSegment } =
        useUpdateSegment()

    const { segmentUsage, isLoading: isLoadingUsage } = useSegmentsUsage(
        segment?.id,
    )

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: segment?.name ?? '',
                conditions: [DEFAULT_CONDITION],
            })
        }
    }, [form, isOpen, segment?.id, segment?.name])

    const handleCancel = useCallback(() => {
        form.reset()
        onClose()
    }, [form, onClose])

    const conditions = useWatch({ control: form.control, name: 'conditions' })
    const name = useWatch({ control: form.control, name: 'name' })

    useEffect(() => {
        if (isOpen) {
            form.reset({
                name: segment?.name ?? '',
                conditions: [DEFAULT_CONDITION],
            })
        }
    }, [isOpen, segment, form])

    const hasNoConditions = buildFullQuery(conditions, schema) === ''

    const hasConditionWithoutValue = conditions.some((c) => {
        if (!c.object || !c.field || !c.operator) return false
        if (isExistenceCondition(c.object, c.field)) {
            if (!c.whereClause) return true
            const wc = c.whereClause
            if (!schema.operators.unary.includes(wc.operator)) {
                const whereVal = wc.value
                if (
                    whereVal === null ||
                    whereVal === undefined ||
                    whereVal === ''
                )
                    return true
                if (Array.isArray(whereVal) && whereVal.length === 0)
                    return true
                if (typeof whereVal === 'string') {
                    return (
                        whereVal
                            .split(',')
                            .map((v) => v.trim())
                            .filter((v) => v !== '').length === 0
                    )
                }
            }
            return false
        }
        if (schema.operators.unary.includes(c.operator)) return false
        const val = c.value
        if (val === null || val === undefined || val === '') return true
        if (Array.isArray(val) && val.length === 0) return true
        if (typeof val === 'string') {
            const items = val
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v !== '')
            return items.length === 0
        }
        if (c.isWhereVisible && c.whereClause) {
            const wc = c.whereClause
            if (!schema.operators.unary.includes(wc.operator)) {
                const whereVal = wc.value
                if (
                    whereVal === null ||
                    whereVal === undefined ||
                    whereVal === ''
                )
                    return true
                if (Array.isArray(whereVal) && whereVal.length === 0)
                    return true
                if (typeof whereVal === 'string') {
                    const items = whereVal
                        .split(',')
                        .map((v) => v.trim())
                        .filter((v) => v !== '')
                    return items.length === 0
                }
            }
        }
        return false
    })

    const conditionsQuery = useMemo(
        () => buildFullQuery(conditions, schema),
        [conditions, schema],
    )
    const debouncedConditionsQuery = useDebouncedValue(conditionsQuery, 500)

    const { data: audienceCountData, isFetching: isAudienceCountFetching } =
        useAudienceCount(
            {
                integration_id: currentIntegration?.id,
                conditions: debouncedConditionsQuery,
            },
            {
                enabled:
                    !!debouncedConditionsQuery && !hasConditionWithoutValue,
            },
        )

    const shouldDisableSaveButton =
        !name.trim() ||
        hasNoConditions ||
        hasConditionWithoutValue ||
        isCreatingSegment ||
        isUpdatingSegment

    useEffect(() => {
        if (!isOpen) return
        form.reset({
            name: segment?.name ?? '',
            conditions: segment?.conditions
                ? parseConditionsQuery(segment.conditions, schema)
                : [DEFAULT_CONDITION],
        })
    }, [isOpen, segment, form, schema])

    const isEditing = segment !== undefined

    const shouldRenderCountPreview =
        !hasNoConditions && !hasConditionWithoutValue

    const shouldRenderUsageTable =
        isEditing && segment && segmentUsage.length > 0

    const handleSave = form.handleSubmit(async ({ name }) => {
        if (!schema || !currentIntegration?.id) return
        const conditions = buildFullQuery(form.getValues('conditions'), schema)

        try {
            const createdSegment = await createSegment({
                name,
                conditions,
                integration_id: currentIntegration.id,
            })
            onSegmentCreated?.(createdSegment)
            onClose()
        } catch {
            // keep modal open on error
        }
    })

    return (
        <SidePanel
            size={SidePanelSize.Xl}
            onOpenChange={handleCancel}
            isOpen={isOpen}
            withoutPadding
        >
            <FormProvider {...form}>
                <PanelHeader
                    title={isEditing ? 'Edit segment' : 'Create new segment'}
                    flexDirection="row"
                >
                    <button
                        style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                        }}
                        aria-label="close-segment-panel"
                        onClick={handleCancel}
                    >
                        <Icon name="close" />
                    </button>
                </PanelHeader>
                <Box flexDirection="column" height="100%" overflow="hidden">
                    <Box
                        flexDirection="column"
                        padding={Size.Lg}
                        overflow="scroll"
                        flex={1}
                        gap={Size.Md}
                    >
                        <Box flexDirection="column" gap={Size.Lg}>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <TextField
                                        label="Segment name"
                                        isRequired
                                        value={field.value ?? undefined}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <AudienceConditionField schema={schema} />
                        </Box>
                        <Box flexDirection="column" gap={Size.Lg}>
                            {shouldRenderCountPreview && (
                                <SegmentCountPreview
                                    count={audienceCountData?.count}
                                    isLoading={isAudienceCountFetching}
                                />
                            )}
                            {shouldRenderUsageTable && (
                                <Box gap="md" flexDirection="column">
                                    <Heading size="md">Used in</Heading>
                                    <SegmentUsageTable
                                        segmentUsage={segmentUsage}
                                        isLoading={isLoadingUsage}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--spacing-xs)',
                            padding: 'var(--spacing-lg)',
                        }}
                    >
                        <Button
                            variant="tertiary"
                            onClick={() => handleCancel()}
                        >
                            Cancel
                        </Button>
                        <Button
                            isDisabled={shouldDisableSaveButton}
                            onClick={form.handleSubmit(async ({ name }) => {
                                if (isEditing) {
                                    await updateSegment({
                                        segmentId: segment.id,
                                        updateSegmentRequest: {
                                            name,
                                            conditions: buildFullQuery(
                                                conditions,
                                                schema,
                                            ),
                                        },
                                    })
                                    onClose()
                                } else await handleSave()
                            })}
                        >
                            Save segment
                        </Button>
                    </Box>
                </Box>
            </FormProvider>
        </SidePanel>
    )
}
