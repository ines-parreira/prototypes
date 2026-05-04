import { useCallback, useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import { Link } from 'react-router-dom'

import { LegacyLabel as Label } from '@gorgias/axiom'
import { RequirementType } from '@gorgias/helpdesk-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldConditions } from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import { isCustomFieldSystemReadOnly } from 'custom-fields/types'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import useAppDispatch from 'hooks/useAppDispatch'
import { populateConditionalFieldIds } from 'pages/aiAgent/hooks/utils/add-conditional-custom-field-ids-based-on-conditions.util'
import type { FormValues, UpdateValue } from 'pages/aiAgent/types'
import type { Value } from 'pages/common/forms/SelectField/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { StoreCustomFieldsList } from './StoreCustomFieldList'
import { useCustomFieldsState } from './useCustomFieldsState'

import css from './CustomFieldsFormComponent.less'

export type Props = Pick<FormValues, 'customFieldIds'> & {
    updateValue: UpdateValue<FormValues>
    isStoreCreated: boolean
}

export const CustomFieldsFormComponent = ({
    customFieldIds,
    updateValue,
    isStoreCreated,
}: Props) => {
    const {
        data: { data: accountCustomFields = [] } = {},
        error: customFieldFetchError,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })

    const { customFieldConditions = [] } = useCustomFieldConditions({
        objectType: OBJECT_TYPES.TICKET,
        includeDeactivated: false,
        enabled: true,
    })

    const {
        state,
        setSelectedFields,
        clearSelectedFields,
        setSelectDisabled,
        autoFillRequiredFields,
        removeField,
    } = useCustomFieldsState()

    const dispatch = useAppDispatch()

    // Compute available options based on the fetched fields and existing selection
    const availableSelectCustomFieldOptions = useMemo<CustomField[]>(
        () =>
            accountCustomFields.filter(
                (field) =>
                    // Only non-read only custom fields
                    !isCustomFieldSystemReadOnly(field.managed_type ?? null) &&
                    // Only non-conditional custom fields
                    field.requirement_type !== RequirementType.Conditional &&
                    !customFieldIds?.includes(field.id),
            ),
        [accountCustomFields, customFieldIds],
    )

    const accountCustomFieldMap = useMemo(() => {
        const map = new Map<number, CustomField>()
        accountCustomFields.forEach((field) => {
            map.set(field.id, field)
        })
        return map
    }, [accountCustomFields])

    // Update selected custom fields via custom hook
    const handleCustomFieldSelectionUpdate = useCallback(
        (newValues: Value[]) => {
            const conditionalFields = populateConditionalFieldIds(
                customFieldConditions ?? [],
                newValues as number[],
            )
            setSelectedFields([...newValues, ...conditionalFields])
        },
        [setSelectedFields, customFieldConditions],
    )

    // When closing the SelectFilter, update the parent state and clear the local selection.
    // Dedupe the merged ids — newly-selected fields may include conditional dependencies
    // already present in `customFieldIds` (e.g. a conditional shared between two non-conditional
    // fields). Without dedupe, those would appear twice in the list and break React keys.
    const handleCustomFieldSelectFilterClose = useCallback(() => {
        const mergedIds = [
            ...(customFieldIds ?? []),
            ...state.selectedCustomFields.map((id) => Number(id)),
        ]
        updateValue('customFieldIds', Array.from(new Set(mergedIds)))
        clearSelectedFields()
    }, [
        customFieldIds,
        state.selectedCustomFields,
        updateValue,
        clearSelectedFields,
    ])

    // Remove a custom field from store configuration. A conditional field should only be
    // removed when no other still-selected non-conditional field requires it.
    const handleCustomFieldRemovalFromStoreConfiguration = useCallback(
        (id: number) => {
            const remainingFieldIds = (customFieldIds ?? []).filter(
                (fieldId) => fieldId !== id,
            )

            const stillRequiredConditionalIds = new Set<CustomField['id']>()
            customFieldConditions.forEach((condition) => {
                const triggersStillPresent = condition.expression.some(
                    (expression) =>
                        remainingFieldIds.includes(Number(expression.field)),
                )
                if (triggersStillPresent) {
                    condition.requirements.forEach((requirement) =>
                        stillRequiredConditionalIds.add(requirement.field_id),
                    )
                }
            })

            const conditionalsToRemove = new Set<CustomField['id']>()
            customFieldConditions
                .filter((condition) =>
                    condition.expression.some(
                        (expression) => expression.field === id,
                    ),
                )
                .forEach((condition) =>
                    condition.requirements.forEach((requirement) => {
                        if (
                            !stillRequiredConditionalIds.has(
                                requirement.field_id,
                            )
                        ) {
                            conditionalsToRemove.add(requirement.field_id)
                        }
                    }),
                )

            const newCustomFieldIds = remainingFieldIds.filter(
                (fieldId) => !conditionalsToRemove.has(fieldId),
            )

            updateValue('customFieldIds', newCustomFieldIds)
            removeField(id)
        },
        [customFieldIds, updateValue, removeField, customFieldConditions],
    )

    // Enable or disable the SelectFilter based on available options
    useEffect(() => {
        const shouldDisable = availableSelectCustomFieldOptions.length === 0
        if (shouldDisable !== state.isSelectDisabled) {
            setSelectDisabled(shouldDisable)
        }
    }, [
        availableSelectCustomFieldOptions.length,
        state.isSelectDisabled,
        setSelectDisabled,
    ])

    // Auto-fill required custom fields if the store isn't created yet
    useEffect(() => {
        if (
            !isStoreCreated &&
            accountCustomFields.length &&
            !state.haveRequiredValuesBeenSet
        ) {
            const requiredFieldIds = accountCustomFields
                .filter((field) => field.required === true)
                .map((field) => field.id)
            const currentIds = customFieldIds ?? []
            const missingIds = requiredFieldIds.filter(
                (id) => !currentIds.includes(id),
            )
            if (missingIds.length > 0) {
                updateValue('customFieldIds', [...currentIds, ...missingIds])
                autoFillRequiredFields(missingIds)
            }
        }
    }, [
        isStoreCreated,
        accountCustomFields,
        customFieldIds,
        updateValue,
        state.haveRequiredValuesBeenSet,
        autoFillRequiredFields,
    ])

    useEffect(() => {
        if (customFieldFetchError) {
            reportError(customFieldFetchError, {
                tags: { team: SentryTeam.AI_AGENT },
                extra: { context: 'Error fetching account custom fields' },
            })

            void dispatch(
                notify({
                    message:
                        'An unexpected error happened fetching account custom fields. You can come back later to customize them',
                    status: NotificationStatus.Warning,
                }),
            )
        }
    }, [customFieldFetchError, dispatch])

    if (customFieldFetchError) {
        return null
    }
    return (
        <>
            <div className={css.formGroup}>
                <Label className={css.subsectionHeader}>Ticket Fields</Label>
                <div className={css.formGroupDescription}>
                    Choose which ticket fields AI Agent should autofill. It will
                    follow the rules set in{' '}
                    <Link to={'/app/settings/ticket-field-conditions'}>
                        Field Conditions
                    </Link>
                    . Manage fields in{' '}
                    <Link to={'/app/settings/ticket-fields/active'}>
                        Ticket Field settings
                    </Link>
                    .
                </div>
            </div>
            <div className={css.formGroup}>
                <SelectFilter
                    isDisabled={state.isSelectDisabled}
                    disabledTooltipText="All ticket fields added."
                    onChange={handleCustomFieldSelectionUpdate}
                    onClose={handleCustomFieldSelectFilterClose}
                    value={state.selectedCustomFields}
                    label="Add Ticket Field"
                    searchPlaceholder="Ticket Fields"
                    className={css.selectFilter}
                    hideSelectedCount={true}
                >
                    {availableSelectCustomFieldOptions.map((field) => (
                        <SelectFilter.Item
                            key={field.id}
                            label={field.label}
                            value={field.id}
                        />
                    ))}
                </SelectFilter>
                {customFieldIds && (
                    <StoreCustomFieldsList
                        customFieldIds={customFieldIds}
                        accountCustomFieldMap={accountCustomFieldMap}
                        onDelete={
                            handleCustomFieldRemovalFromStoreConfiguration
                        }
                    />
                )}
            </div>
        </>
    )
}
