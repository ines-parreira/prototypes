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
import { useConditionsMetadata } from 'AIJourney/queries/useConditionsMetadata/useConditionsMetadata'
import type { ConditionState } from 'AIJourney/types/conditionField'
import { DEFAULT_CONDITION } from 'AIJourney/types/conditionField'
import { buildFullQuery } from 'AIJourney/utils/conditionQueryBuilder/conditionQueryBuilder'

type SegmentFormValues = {
    name: string
    conditions: ConditionState[]
}

export const SegmentsSidePanel = ({
    isOpen,
    onClose,
    segment,
}: {
    isOpen: boolean
    onClose: () => void
    segment?: Segment
}) => {
    const form = useForm<SegmentFormValues>({
        defaultValues: {
            name: segment?.name ?? '',
            conditions: [DEFAULT_CONDITION],
        },
    })

    const { data: schema } = useConditionsMetadata()

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
                        {schema && <AudienceConditionField schema={schema} />}
                        <Box gap={Size.Xs} justifyContent="flex-end">
                            <Button
                                variant="tertiary"
                                onClick={() => handleCancel()}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (schema) {
                                        const query = buildFullQuery(
                                            conditions,
                                            schema,
                                        )
                                        window.alert(
                                            JSON.stringify(query, null, 2),
                                        )
                                    }
                                    onClose()
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
