import { useCallback, useMemo } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import type { ObjectType } from '@gorgias/helpdesk-types'

import type { CustomFieldValue } from 'custom-fields/types'
import CustomFieldIdInput from 'pages/common/components/ast/widget/CustomFieldIdInput'
import CustomFieldSelect from 'pages/common/components/ast/widget/CustomFieldSelect'

import css from './SetCustomFieldValueAction.less'

type Props = {
    action: Map<string, any>
    actions: List<Map<string, any>> | null
    index: number
    updateActionArgs: (index: number, args: Map<string, any>) => void
    objectType?: ObjectType
}

const SetCustomFieldValueAction = ({
    action,
    actions,
    index,
    updateActionArgs,
    objectType = 'Ticket',
}: Props) => {
    const args = (action.get('arguments') as Map<string, any>).toJS()
    const customFieldId = action.getIn(['arguments', 'custom_field_id'], '')
    const value = action.getIn(['arguments', 'value'], '')

    const idsAlreadySet = useMemo(() => {
        return actions
            ?.map((action?: Map<any, any>) => {
                return Number.parseInt(
                    action?.getIn(['arguments', 'custom_field_id'], '') || '',
                    10,
                )
            })
            .filter((id) => !Number.isNaN(id))
            .toJS() as number[]
    }, [actions])

    const handleFieldIdChange = useCallback(
        (newValue: number) =>
            updateActionArgs(
                index,
                fromJS({ ...args, custom_field_id: newValue }),
            ),
        [updateActionArgs, index, args],
    )

    const handleFieldValueChange = useCallback(
        (newValue: Maybe<CustomFieldValue | CustomFieldValue[]>) =>
            updateActionArgs(index, fromJS({ ...args, value: newValue })),
        [updateActionArgs, index, args],
    )

    return (
        <div className={css.container}>
            <CustomFieldSelect
                className={css.select}
                onChange={handleFieldIdChange}
                value={customFieldId}
                idsAlreadySet={idsAlreadySet}
                required
                objectType={objectType}
            />
            {customFieldId && (
                <CustomFieldIdInput
                    className={css.input}
                    customFieldId={customFieldId}
                    onChange={handleFieldValueChange}
                    value={value}
                />
            )}
        </div>
    )
}

export default SetCustomFieldValueAction
