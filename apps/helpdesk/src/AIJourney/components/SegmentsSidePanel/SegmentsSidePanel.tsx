import { useCallback, useEffect, useMemo } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'

import {
    Box,
    Button,
    Heading,
    SidePanel,
    SidePanelSize,
    Size,
    TextField,
} from '@gorgias/axiom'

import { AudienceConditionField } from 'AIJourney/components/AudienceConditionField/AudienceConditionField'
import { SegmentCountPreview } from 'AIJourney/components/SegmentCountPreview/SegmentCountPreview'
import { SegmentUsageTable } from 'AIJourney/components/SegmentsSidePanel/SegmentUsageTable'
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
}: {
    isOpen: boolean
    onClose: () => void
    segment?: Segment
    schema: ConditionsSchema
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

    useEffect(() => {
        buildFullQuery(conditions, schema)
    }, [conditions, schema])
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
            { enabled: !!debouncedConditionsQuery },
        )

    const hasNoConditions = buildFullQuery(conditions, schema) === ''

    const hasConditionWithoutValue = conditions.some((c) => {
        if (!c.object || !c.field || !c.operator) return false
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

    const handleSave = form.handleSubmit(async ({ name }) => {
        if (!schema || !currentIntegration?.id) return
        const conditions = buildFullQuery(form.getValues('conditions'), schema)

        try {
            await createSegment({
                name,
                conditions,
                integration_id: currentIntegration.id,
            })
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
                <Box
                    flexDirection="column"
                    padding={Size.Lg}
                    paddingTop={Size.Md}
                    overflow="scroll"
                >
                    <Heading size="xl">
                        {isEditing ? 'Edit segment' : 'Create new segment'}
                    </Heading>

                    <Box
                        marginTop={Size.Md}
                        flexDirection="column"
                        gap={Size.Lg}
                        height="100%"
                        overflow="scroll"
                    >
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
                        <SegmentCountPreview
                            count={audienceCountData?.count}
                            isLoading={isAudienceCountFetching}
                        />
                        {isEditing && segment && (
                            <Box gap="md" flexDirection="column">
                                <Heading size="md">Used in</Heading>
                                <SegmentUsageTable segmentId={segment.id} />
                            </Box>
                        )}
                        <Box gap={Size.Xs} justifyContent="flex-end">
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
                </Box>
            </FormProvider>
        </SidePanel>
    )
}
