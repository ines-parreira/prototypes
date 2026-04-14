import { useCallback, useEffect } from 'react'

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
import type { Segment } from 'AIJourney/pages/Segments/Segments'
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
    const form = useForm<SegmentFormValues>({
        defaultValues: {
            name: segment?.name ?? '',
            conditions: [DEFAULT_CONDITION],
        },
    })

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
        buildFullQuery(conditions, schema)
    }, [conditions, schema])

    const hasNoConditions = conditions.length === 0

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
        return false
    })

    const shouldDisableSaveButton =
        !name.trim() || hasNoConditions || hasConditionWithoutValue

    useEffect(() => {
        if (!isOpen) return
        form.reset({
            name: segment?.name ?? '',
            conditions: segment?.conditions
                ? parseConditionsQuery(segment.conditions)
                : [DEFAULT_CONDITION],
        })
    }, [isOpen, segment, form])

    const isEditing = segment !== undefined

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
                    padding={Size.Md}
                    paddingTop={Size.Lg}
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
                        <Box gap={Size.Xs} justifyContent="flex-end">
                            <Button
                                variant="tertiary"
                                onClick={() => handleCancel()}
                            >
                                Cancel
                            </Button>
                            <Button
                                isDisabled={shouldDisableSaveButton}
                                onClick={() => {
                                    const query = buildFullQuery(
                                        conditions,
                                        schema,
                                    )
                                    window.alert(JSON.stringify(query, null, 2))
                                }}
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
