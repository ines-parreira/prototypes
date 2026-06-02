import { useFieldArray, useFormContext, useWatch } from '@repo/forms'
import { Controller, useController } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import {
    Box,
    Button,
    Card,
    Heading,
    NumberField,
    Text,
    TextAreaField,
} from '@gorgias/axiom'

import { MessageGuidanceFieldEditor } from './MessageGuidanceFieldEditor'
import type { MessageInstructionsVariant } from './types'
import {
    computeControlWeight,
    MIN_VARIANT_WEIGHT,
    remainingWeightFor,
} from './types'

import css from './MessageGuidance.less'

const MESSAGE_GUIDANCE_MAX_LENGTH = 4000
const ADDED_VARIANT_TARGET_WEIGHT = 10

type MessageGuidanceVariantsProps = {
    isStructuredEditorEnabled?: boolean
    shopName: string
    editorLabel?: string
    editorDescription?: string
}

export const MessageGuidanceVariants = ({
    isStructuredEditorEnabled = false,
    shopName,
    editorLabel,
    editorDescription,
}: MessageGuidanceVariantsProps) => {
    const { control } = useFormContext()

    const {
        field: { value: messageGuidance, onChange: setMessageGuidance },
        fieldState: { error },
    } = useController({
        name: 'message_instructions',
        defaultValue: '',
        rules: { required: 'Please provide message guidance to continue.' },
    })

    const { fields, append, remove } = useFieldArray({ name: 'variants' })
    const variants = (useWatch({ name: 'variants' }) ??
        []) as MessageInstructionsVariant[]

    const controlWeight = computeControlWeight(variants)
    const remainingForNewVariant = remainingWeightFor(variants)
    const remainingChars =
        MESSAGE_GUIDANCE_MAX_LENGTH - (messageGuidance ?? '').length

    const handleAddVariant = () => {
        append({
            id: uuidv4(),
            message_instructions: '',
            weight: Math.min(
                ADDED_VARIANT_TARGET_WEIGHT,
                remainingForNewVariant,
            ),
        })
    }

    return (
        <Box flexDirection="column" gap="md" className={css.variantsBox}>
            <Card className={css.variantCard}>
                <Box flexDirection="column" gap="xs">
                    <Heading size="sm">{`Control · ${controlWeight}%`}</Heading>
                    {isStructuredEditorEnabled ? (
                        <>
                            <MessageGuidanceFieldEditor
                                value={messageGuidance ?? ''}
                                onChange={setMessageGuidance}
                                shopName={shopName}
                                charLimit={MESSAGE_GUIDANCE_MAX_LENGTH}
                                label={editorLabel}
                                description={editorDescription}
                            />
                            {error?.message && (
                                <Text className={css.errorText}>
                                    {error.message}
                                </Text>
                            )}
                        </>
                    ) : (
                        <TextAreaField
                            placeholder="Describe tone, formatting, or what to include"
                            maxLength={MESSAGE_GUIDANCE_MAX_LENGTH}
                            caption={`${remainingChars} characters remaining`}
                            error={error?.message}
                            value={messageGuidance}
                            onChange={setMessageGuidance}
                            autoResize
                            rows={8}
                            maxRows={20}
                        />
                    )}
                </Box>
            </Card>
            {fields.map((field, index) => {
                const currentWeight = variants[index]?.weight ?? 0
                const maxForThisVariant = Math.max(
                    MIN_VARIANT_WEIGHT,
                    remainingWeightFor(variants, index),
                )
                return (
                    <Card key={field.id} className={css.variantCard}>
                        <Box flexDirection="column" gap="xs">
                            <Box
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Heading size="sm">{`Variant ${index + 1} · ${currentWeight}%`}</Heading>
                                <Button
                                    icon="trash-empty"
                                    intent="destructive"
                                    variant="secondary"
                                    aria-label={`Remove variant ${index + 1}`}
                                    onClick={() => remove(index)}
                                />
                            </Box>
                            <Controller
                                control={control}
                                name={`variants.${index}.message_instructions`}
                                rules={{
                                    required:
                                        'Please provide variant message guidance.',
                                }}
                                render={({
                                    field: variantField,
                                    fieldState: { error: variantError },
                                }) => {
                                    const variantValue =
                                        variantField.value ?? ''
                                    if (isStructuredEditorEnabled) {
                                        return (
                                            <Box
                                                flexDirection="column"
                                                gap="xxxs"
                                            >
                                                <MessageGuidanceFieldEditor
                                                    value={variantValue}
                                                    onChange={
                                                        variantField.onChange
                                                    }
                                                    shopName={shopName}
                                                    charLimit={
                                                        MESSAGE_GUIDANCE_MAX_LENGTH
                                                    }
                                                    label={editorLabel}
                                                    description={
                                                        editorDescription
                                                    }
                                                />
                                                {variantError?.message && (
                                                    <Text
                                                        className={
                                                            css.errorText
                                                        }
                                                    >
                                                        {variantError.message}
                                                    </Text>
                                                )}
                                            </Box>
                                        )
                                    }
                                    return (
                                        <TextAreaField
                                            placeholder="Describe tone, formatting, or what to include"
                                            maxLength={
                                                MESSAGE_GUIDANCE_MAX_LENGTH
                                            }
                                            caption={`${
                                                MESSAGE_GUIDANCE_MAX_LENGTH -
                                                variantValue.length
                                            } characters remaining`}
                                            error={variantError?.message}
                                            value={variantValue}
                                            onChange={variantField.onChange}
                                            autoResize
                                            rows={6}
                                            maxRows={20}
                                        />
                                    )
                                }}
                            />
                            <Controller
                                control={control}
                                name={`variants.${index}.weight`}
                                render={({ field: weightField }) => (
                                    <NumberField
                                        label="Weight"
                                        trailingSlot="percent"
                                        style={{ width: '150px' }}
                                        formatOptions={{
                                            style: 'decimal',
                                            useGrouping: false,
                                        }}
                                        value={Number(weightField.value) || 0}
                                        onChange={(next) => {
                                            const numeric = Number(next ?? 0)
                                            const clamped = Math.min(
                                                Math.max(
                                                    MIN_VARIANT_WEIGHT,
                                                    numeric,
                                                ),
                                                maxForThisVariant,
                                            )
                                            weightField.onChange(clamped)
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </Card>
                )
            })}
            <Box>
                <Button
                    variant="secondary"
                    leadingSlot="add-plus"
                    onClick={handleAddVariant}
                    isDisabled={remainingForNewVariant <= 0}
                >
                    Add variant
                </Button>
            </Box>
        </Box>
    )
}
