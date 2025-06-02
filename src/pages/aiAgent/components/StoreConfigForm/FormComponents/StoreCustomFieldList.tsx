import { RequirementType } from '@gorgias/helpdesk-queries'
import { IconButton } from '@gorgias/merchant-ui-kit'

import { CustomField } from 'custom-fields/types'
import InputField from 'pages/common/forms/input/InputField'

import css from './CustomFieldsFormComponent.less'

type StoreCustomFieldListItemProps = {
    customField: CustomField
    onDelete: () => void
}

export const StoreCustomFieldComponent = ({
    customField: { id, label },
    onDelete,
}: StoreCustomFieldListItemProps) => {
    return (
        <div
            className={css.ticketFieldRowContainer}
            key={id}
            data-testid="custom-fields-disabled-input-container"
        >
            <InputField
                className={css.ticketFieldInput}
                value={label}
                isDisabled={true}
                data-testid="custom-field-disabled-input"
            />
            <IconButton
                icon="close"
                intent="destructive"
                fillStyle="ghost"
                onClick={onDelete}
                data-testid="custom-field-disabled-input-delete-button"
            />
        </div>
    )
}

interface StoreCustomFieldsListProps {
    customFieldIds: number[]
    accountCustomFieldMap: Map<number, CustomField>
    onDelete: (id: number) => void
}

export const StoreCustomFieldsList = ({
    customFieldIds,
    accountCustomFieldMap,
    onDelete,
}: StoreCustomFieldsListProps) => {
    return (
        <>
            {customFieldIds.map((id) => {
                const customField = accountCustomFieldMap.get(id)
                if (
                    customField &&
                    customField.requirement_type !== RequirementType.Conditional
                ) {
                    return (
                        <StoreCustomFieldComponent
                            key={customField.id}
                            customField={customField}
                            onDelete={() => onDelete(id)}
                        />
                    )
                }
                return null
            })}
        </>
    )
}
