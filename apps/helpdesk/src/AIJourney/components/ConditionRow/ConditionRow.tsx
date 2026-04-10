import { useFormContext, useWatch } from '@repo/forms'

import {
    Box,
    Button,
    ListItem,
    ListSection,
    SelectField,
    Size,
} from '@gorgias/axiom'

import {
    buildSections,
    buildSelectId,
    defaultValueForType,
    getFieldDef,
    getOperatorOptions,
    parseSelectId,
    toLabel,
} from 'AIJourney/utils/conditionField/conditionField'

import type { ConditionsSchema, SelectOption } from '../../types/conditionField'
import { ConditionInlineSelect } from '../ConditionInlineSelect/ConditionInlineSelect'
import { ConditionValueInput } from '../ConditionValueInput/ConditionValueInput'

import css from './ConditionRow.less'

export const ConditionRow = ({
    index,
    schema,
    onRemove,
}: {
    index: number
    schema: ConditionsSchema
    onRemove: () => void
}) => {
    const { setValue } = useFormContext()

    const [object, field, isAggregate, operator, value] = useWatch({
        name: [
            `conditions.${index}.object`,
            `conditions.${index}.field`,
            `conditions.${index}.isAggregate`,
            `conditions.${index}.operator`,
            `conditions.${index}.value`,
        ],
    }) as [
        string | null,
        string | null,
        boolean,
        string,
        string | number | null,
    ]

    const set = (path: string, val: unknown) =>
        setValue(`conditions.${index}.${path}`, val)

    const fieldDef =
        object && field ? getFieldDef(schema, object, field, isAggregate) : null

    const operatorOptions = fieldDef ? getOperatorOptions(fieldDef) : []
    const isUnary = schema.operators.unary.includes(operator)
    const sections = buildSections(schema)

    const selectValue =
        object && field
            ? (sections
                  .flatMap((s) => s.items)
                  .find(
                      (item) =>
                          item.id === buildSelectId(object, field, isAggregate),
                  ) ?? {
                  id: buildSelectId(object, field, isAggregate),
                  label: toLabel(field),
              })
            : undefined

    const handleFieldChange = (item: SelectOption | null | undefined) => {
        if (!item) return
        const parsed = parseSelectId(item.id)
        if (!parsed) return

        const newFieldDef = getFieldDef(
            schema,
            parsed.object,
            parsed.field,
            parsed.isAggregate,
        )
        if (!newFieldDef) return

        set('object', parsed.object)
        set('field', parsed.field)
        set('isAggregate', parsed.isAggregate)
        set('operator', newFieldDef.operators[0] ?? '')
        set('value', defaultValueForType(newFieldDef.type))
        set('whereClause', null)
    }

    return (
        <Box alignItems="flex-start" gap={Size.Sm}>
            <Box flexGrow={1} flexDirection="column" gap={Size.Sm}>
                <Box alignItems="center" gap={Size.Sm} flexWrap="wrap">
                    <div className={css.fieldSelect}>
                        <SelectField
                            aria-label="Condition field"
                            placement="bottom left"
                            placeholder="Select condition"
                            items={sections}
                            value={selectValue}
                            onChange={handleFieldChange}
                            isSearchable
                        >
                            {(section) => (
                                <ListSection
                                    id={section.id}
                                    name={section.name}
                                    items={section.items}
                                >
                                    {(option) => (
                                        <ListItem
                                            id={option.id}
                                            label={option.label}
                                        />
                                    )}
                                </ListSection>
                            )}
                        </SelectField>
                    </div>

                    {fieldDef && (
                        <>
                            <ConditionInlineSelect
                                items={operatorOptions}
                                selectedId={operator}
                                onSelect={(id) => {
                                    set('operator', id)
                                    if (schema.operators.unary.includes(id)) {
                                        set('value', null)
                                    }
                                }}
                                ariaLabel="operator"
                            />
                            <ConditionValueInput
                                fieldDef={fieldDef}
                                field={field ?? undefined}
                                value={value}
                                onChange={(val) => set('value', val)}
                                isUnary={isUnary}
                                operator={operator}
                            />
                        </>
                    )}
                </Box>
            </Box>

            <Button
                icon="trash-empty"
                intent="destructive"
                variant="secondary"
                aria-label="Remove condition"
                onClick={onRemove}
            />
        </Box>
    )
}
