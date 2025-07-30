import { ExpressionFieldType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinition } from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import { CustomFieldDefinition } from 'custom-fields/types'
import IconButton from 'pages/common/components/button/IconButton'
import LinkButton from 'pages/common/components/button/LinkButton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import CheckBoxField from 'pages/common/forms/CheckBoxField'

import css from './ThenFieldRow.less'

function definitionToString(definition: CustomFieldDefinition): string {
    if (definition.data_type === 'boolean') {
        return 'Yes/No'
    }
    if (definition.input_settings.input_type === 'dropdown') {
        return 'Dropdown'
    }
    if (definition.input_settings.input_type === 'input_number') {
        return 'Number'
    }
    return 'Text'
}

type ThenFieldRowProps = {
    fieldId: number
    requirement: ExpressionFieldType
    onChange: (value: ExpressionFieldType) => void
    onDelete: () => void
}

export default function ThenFieldRow(props: ThenFieldRowProps) {
    const customField = useCustomFieldDefinition(props.fieldId).data
    if (!customField) {
        return null
    }

    return (
        <TableBodyRow>
            <BodyCell className={css.nameCell}>{customField.label}</BodyCell>
            <BodyCell>{definitionToString(customField.definition)}</BodyCell>
            <BodyCell>
                <CheckBoxField
                    value={props.requirement === 'required'}
                    label="Required"
                    labelClassName={css.requiredLabel}
                    onChange={(value: boolean) =>
                        props.onChange(value ? 'required' : 'visible')
                    }
                />
            </BodyCell>
            <BodyCell>
                <LinkButton
                    fillStyle="ghost"
                    intent="secondary"
                    title="Edit field"
                    href={`/app/settings/ticket-fields/${customField.id}/edit`}
                    className={css.iconLinkButton}
                >
                    <i className="material-icons">open_in_new</i>
                </LinkButton>
                <IconButton
                    fillStyle="ghost"
                    intent="destructive"
                    title="Remove field"
                    onClick={props.onDelete}
                    className="ml-2"
                >
                    delete
                </IconButton>
            </BodyCell>
        </TableBodyRow>
    )
}
