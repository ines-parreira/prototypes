import { useFieldArray } from '@repo/forms'

import {
    Box,
    Button,
    Card,
    Heading,
    Size,
    StatusButton,
    StatusButtonColor,
    Text,
} from '@gorgias/axiom'

import type { ConditionsSchema } from '../../types/conditionField'
import { DEFAULT_CONDITION } from '../../types/conditionField'
import { ConditionRow } from '../ConditionRow/ConditionRow'

import css from './AudienceConditionField.less'

export const AudienceConditionField = ({
    schema,
}: {
    schema: ConditionsSchema
}) => {
    const { fields, append, remove } = useFieldArray({ name: 'conditions' })

    return (
        <Box flexDirection="column" gap={Size.Md}>
            <Box flexDirection="column">
                <Box>
                    <Heading size="md">Conditions</Heading>
                    <Text color="content-error-default">*</Text>
                </Box>
                <Text color="content-neutral-secondary">
                    Define eligibility criteria, at least one condition is
                    mandatory. All conditions must match (AND logic).
                </Text>
            </Box>
            <Box
                flexDirection="column"
                gap={Size.Md}
                padding={Size.Md}
                className={css.greyBox}
            >
                {fields.map((field, index) => (
                    <Box flexDirection="column" gap={Size.Md} key={field.id}>
                        {index > 0 && (
                            <Box>
                                <StatusButton
                                    className={css.pill}
                                    color={StatusButtonColor.Purple}
                                >
                                    AND
                                </StatusButton>
                            </Box>
                        )}
                        <Card className={css.conditionCard}>
                            <Box flexDirection="column" gap={Size.Md}>
                                <ConditionRow
                                    index={index}
                                    schema={schema}
                                    onRemove={() => remove(index)}
                                />
                            </Box>
                        </Card>
                    </Box>
                ))}
                <Box>
                    <Button
                        variant="secondary"
                        leadingSlot="add-plus"
                        onClick={() => append(DEFAULT_CONDITION)}
                    >
                        Add condition
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}
