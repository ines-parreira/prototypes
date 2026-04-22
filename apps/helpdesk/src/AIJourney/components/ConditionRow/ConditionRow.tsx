import { useFormContext, useWatch } from '@repo/forms'

import {
    Box,
    Button,
    Icon,
    ListItem,
    ListSection,
    SelectField,
    Size,
    Text,
} from '@gorgias/axiom'

import {
    buildSections,
    buildSelectId,
    defaultValueForType,
    getFieldDef,
    getOperatorOptions,
    isExistenceCondition,
    parseSelectId,
    toLabel,
    WHERE_FIELD_ALLOWLIST,
} from 'AIJourney/utils/conditionField/conditionField'

import type {
    AggregateDef,
    ConditionsSchema,
    PurchaseDateClause,
    SelectOption,
    WhereClause,
} from '../../types/conditionField'
import { ConditionInlineSelect } from '../ConditionInlineSelect/ConditionInlineSelect'
import { ConditionValueInput } from '../ConditionValueInput/ConditionValueInput'

import css from './ConditionRow.less'

const PURCHASE_DATE_OPTIONS: SelectOption[] = [
    { id: 'all_time', label: 'All time' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '365d', label: 'Last 365 days' },
]

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

    const [
        object,
        field,
        isAggregate,
        operator,
        value,
        whereClause,
        purchaseDateClause,
        isWhereVisible,
    ] = useWatch({
        name: [
            `conditions.${index}.object`,
            `conditions.${index}.field`,
            `conditions.${index}.isAggregate`,
            `conditions.${index}.operator`,
            `conditions.${index}.value`,
            `conditions.${index}.whereClause`,
            `conditions.${index}.purchaseDateClause`,
            `conditions.${index}.isWhereVisible`,
        ],
    }) as [
        string | null,
        string | null,
        boolean,
        string,
        string | number | string[] | null,
        WhereClause | null,
        PurchaseDateClause | null,
        boolean,
    ]

    const set = (path: string, val: unknown) =>
        setValue(`conditions.${index}.${path}`, val)

    const existenceMode =
        object !== null && field !== null && isExistenceCondition(object, field)

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

    const buildDefaultWhereClause = (obj: string): WhereClause => {
        const firstField =
            WHERE_FIELD_ALLOWLIST.find(
                ({ field: wf }) => schema.objects[obj]?.fields[wf] != null,
            )?.field ?? ''
        const firstFieldDef = firstField
            ? schema.objects[obj]?.fields[firstField]
            : null
        return {
            field: firstField,
            operator: firstFieldDef?.operators[0] ?? '',
            value: defaultValueForType(firstFieldDef?.type ?? 'string'),
        }
    }

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

        if (isExistenceCondition(parsed.object, parsed.field)) {
            set('object', parsed.object)
            set('field', parsed.field)
            set('isAggregate', false)
            set('operator', 'isNotEmpty')
            set('value', null)
            set('whereClause', buildDefaultWhereClause(parsed.object))
            set('purchaseDateClause', null)
            set('isWhereVisible', true)
            return
        }

        const defaultOperator = newFieldDef.operators[0] ?? ''
        const defaultValue = defaultValueForType(newFieldDef.type)

        let newWhereClause: WhereClause | null = null
        if (
            parsed.isAggregate &&
            (newFieldDef as AggregateDef).supports_where
        ) {
            const firstField =
                WHERE_FIELD_ALLOWLIST.find(
                    ({ field: wf }) =>
                        schema.objects[parsed.object]?.fields[wf] != null,
                )?.field ?? ''
            const firstFieldDef = firstField
                ? schema.objects[parsed.object]?.fields[firstField]
                : null
            newWhereClause = {
                field: firstField,
                operator: firstFieldDef?.operators[0] ?? '',
                value: defaultValueForType(firstFieldDef?.type ?? 'string'),
            }
        }

        const newSupportsPurchaseDate =
            parsed.isAggregate &&
            schema.objects[parsed.object]?.fields['purchase_date'] != null

        set('object', parsed.object)
        set('field', parsed.field)
        set('isAggregate', parsed.isAggregate)
        set('operator', defaultOperator)
        set('value', defaultValue)
        set('whereClause', newWhereClause)
        set(
            'purchaseDateClause',
            newSupportsPurchaseDate
                ? ({
                      operator: 'isNotEmpty',
                      value: null,
                  } satisfies PurchaseDateClause)
                : null,
        )
        set('isWhereVisible', false)
    }

    const supportsWhere =
        !existenceMode &&
        fieldDef &&
        isAggregate &&
        (fieldDef as AggregateDef).supports_where

    const supportsPurchaseDateFilter =
        !existenceMode &&
        isAggregate &&
        object != null &&
        schema.objects[object]?.fields['purchase_date'] != null

    const whereFieldOptions = object
        ? WHERE_FIELD_ALLOWLIST.flatMap(({ field: wf, label }) =>
              schema.objects[object]?.fields[wf] != null
                  ? [{ id: wf, label }]
                  : [],
          )
        : []

    const whereFieldDef =
        whereClause?.field && object
            ? schema.objects[object]?.fields[whereClause.field]
            : null

    const whereOperatorOptions = whereFieldDef
        ? getOperatorOptions(whereFieldDef)
        : []

    const isWhereUnary = whereClause?.operator
        ? schema.operators.unary.includes(whereClause.operator)
        : false

    const handleCloseWhereClause = () => {
        const firstOption = whereFieldOptions[0]
        if (firstOption && object) {
            const firstFieldDef = schema.objects[object]?.fields[firstOption.id]
            set('whereClause', {
                field: firstOption.id,
                operator: firstFieldDef?.operators[0] ?? '',
                value: defaultValueForType(firstFieldDef?.type ?? 'string'),
            })
        }
        set('isWhereVisible', false)
    }

    const handleOperatorChange = (id: string) => {
        set('operator', id)
        if (existenceMode) {
            set('whereClause', buildDefaultWhereClause(object!))
            set('isWhereVisible', true)
            return
        }
        if (schema.operators.unary.includes(id)) {
            set('value', null)
        } else if (field === 'address_state_code') {
            const isMulti = id === 'containsAny' || id === 'notContainsAny'
            const wasMulti =
                operator === 'containsAny' || operator === 'notContainsAny'
            if (isMulti !== wasMulti) {
                set('value', null)
            }
        }
    }

    const renderWhereClause = (showCloseButton: boolean) => (
        <Box alignItems="center" gap={Size.Xs} flexWrap="wrap">
            <Text color="content-neutral-secondary">where</Text>
            <ConditionInlineSelect
                items={whereFieldOptions}
                selectedId={whereClause!.field}
                onSelect={(f) => {
                    const newWhereFieldDef = object
                        ? schema.objects[object]?.fields[f]
                        : null
                    set('whereClause', {
                        field: f,
                        operator: newWhereFieldDef?.operators[0] ?? '',
                        value: defaultValueForType(
                            newWhereFieldDef?.type ?? 'string',
                        ),
                    })
                }}
                ariaLabel="Where field"
            />
            <ConditionInlineSelect
                items={whereOperatorOptions}
                selectedId={whereClause!.operator}
                onSelect={(op) => {
                    set('whereClause', {
                        ...whereClause,
                        operator: op,
                        value: schema.operators.unary.includes(op)
                            ? null
                            : whereClause!.value,
                    })
                }}
                ariaLabel="Where operator"
            />
            <Box alignItems="center" gap={Size.Xs}>
                {whereFieldDef && !isWhereUnary && (
                    <ConditionValueInput
                        fieldDef={whereFieldDef}
                        field={whereClause!.field}
                        value={whereClause!.value}
                        onChange={(val) =>
                            set('whereClause', {
                                ...whereClause,
                                value: val,
                            })
                        }
                        isUnary={false}
                        operator={whereClause!.operator}
                    />
                )}
                {showCloseButton && (
                    <button
                        className={css.addWhereButton}
                        aria-label="remove-where-condition"
                        onClick={handleCloseWhereClause}
                    >
                        <Icon name="close" />
                    </button>
                )}
            </Box>
        </Box>
    )

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
                            {!existenceMode && (
                                <ConditionInlineSelect
                                    items={operatorOptions}
                                    selectedId={operator}
                                    onSelect={handleOperatorChange}
                                    ariaLabel="operator"
                                />
                            )}
                            {!existenceMode && (
                                <ConditionValueInput
                                    fieldDef={fieldDef}
                                    field={field ?? undefined}
                                    value={value}
                                    onChange={(val) => set('value', val)}
                                    isUnary={isUnary}
                                    operator={operator}
                                />
                            )}
                            {supportsPurchaseDateFilter && (
                                <>
                                    <Text color="content-neutral-secondary">
                                        in
                                    </Text>
                                    <ConditionInlineSelect
                                        items={PURCHASE_DATE_OPTIONS}
                                        selectedId={
                                            purchaseDateClause?.value ??
                                            'all_time'
                                        }
                                        onSelect={(id) => {
                                            set(
                                                'purchaseDateClause',
                                                id === 'all_time'
                                                    ? ({
                                                          operator:
                                                              'isNotEmpty',
                                                          value: null,
                                                      } satisfies PurchaseDateClause)
                                                    : ({
                                                          operator: 'gt',
                                                          value: id,
                                                      } satisfies PurchaseDateClause),
                                            )
                                        }}
                                        ariaLabel="Purchase date period"
                                    />
                                </>
                            )}
                        </>
                    )}
                </Box>

                {/* Existence mode: where clause is mandatory when operator is isNotEmpty */}
                {existenceMode &&
                    operator === 'isNotEmpty' &&
                    whereClause &&
                    renderWhereClause(false)}

                {/* Regular aggregate where clause */}
                {supportsWhere && whereClause && !isWhereVisible && (
                    <Box>
                        <button
                            className={css.addWhereButton}
                            onClick={() => set('isWhereVisible', true)}
                        >
                            <Text color="content-accent-default">
                                Add property
                            </Text>
                        </button>
                    </Box>
                )}
                {supportsWhere &&
                    whereClause &&
                    isWhereVisible &&
                    renderWhereClause(true)}
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
