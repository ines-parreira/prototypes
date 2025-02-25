import React, { useMemo } from 'react'

import { fromJS, List, Map } from 'immutable'
import _capitalize from 'lodash/capitalize'
import { Button } from 'reactstrap'

import * as viewsConfig from 'config/views'
import CustomFieldSelect from 'pages/common/components/ast/widget/CustomFieldSelect'
import { humanizeString } from 'utils'

import { getCustomFieldIdFromObjectPath } from './utils'

type Props = {
    view: Map<any, any>
    objectPath: string
    onCustomFieldChange: (customFieldId: number) => void
}

export default function Left({ objectPath, view, onCustomFieldChange }: Props) {
    // just remove the first object name. Ex: ticket.customer.id ==> customer.id
    const suffixPath = objectPath.split('.').slice(1).join('.')

    const isCustomFieldObject = suffixPath.includes('custom_fields')
    const customFieldId = useMemo(() => {
        return getCustomFieldIdFromObjectPath(suffixPath)
    }, [suffixPath])

    const fields = viewsConfig
        .getConfigByType(view.get('type'))
        .get('fields', fromJS([])) as List<any>
    // now find our field and return its title
    const field = fields.find(
        (f: Map<any, any>) =>
            f.get('path') === suffixPath ||
            (isCustomFieldObject && f.get('path') === 'custom_fields'),
    ) as Map<any, any>

    return (
        <>
            <Button className="btn-frozen" tag="div" size="sm" color="primary">
                {field
                    ? field.get('title')
                    : _capitalize(humanizeString(suffixPath))}
            </Button>
            {isCustomFieldObject && (
                <CustomFieldSelect
                    value={customFieldId}
                    onChange={onCustomFieldChange}
                />
            )}
        </>
    )
}
