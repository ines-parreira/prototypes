import { ReactNode } from 'react'

import { MacroAction } from '@gorgias/helpdesk-types'

import { CustomField } from 'custom-fields/types'
import { MacroActionName } from 'models/macroAction/types'

import { CustomFieldName } from './CustomFieldName'

import css from './Preview.less'

export const SetCustomFieldValuesPreview = ({
    actions,
}: {
    actions?: MacroAction[]
}) => {
    const SCFActions = actions?.filter(
        (action) => action.name === MacroActionName.SetCustomFieldValue,
    )

    if (!SCFActions?.length) return null

    return SCFActions.map((action, index) => (
        <div className={css.macroData} key={index}>
            <strong className="text-muted mr-2">
                <CustomFieldName
                    customFieldId={
                        action.arguments?.custom_field_id as CustomField['id']
                    }
                />
                :
            </strong>
            <b className={css.integrationAction}>
                {action.arguments?.value as ReactNode}
            </b>
        </div>
    ))
}
