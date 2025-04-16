import { useMemo } from 'react'

import { fromJS, List, Map } from 'immutable'
import _capitalize from 'lodash/capitalize'
import { Button } from 'reactstrap'

import * as viewsConfig from 'config/views'
import CustomFieldSelect from 'pages/common/components/ast/widget/CustomFieldSelect'
import QAScoreSelect from 'pages/common/components/ViewTable/Filters/QAScoreSelect'
import { getQaScoreDimensionFromObjectPath } from 'pages/common/components/ViewTable/Filters/utils/qaScoreDimensions'
import { humanizeString } from 'utils'

import { getCustomFieldIdFromObjectPath } from './utils'

type Props = {
    view: Map<any, any>
    objectPath: string
    onCustomFieldChange: (customFieldId: number) => void
    onQAScoreDimensionFieldChange: (qaScoreDimension: string) => void
}

export default function Left({
    objectPath,
    view,
    onCustomFieldChange,
    onQAScoreDimensionFieldChange,
}: Props) {
    // just remove the first object name. Ex: ticket.customer.id ==> customer.id
    const suffixPath = useMemo(
        () => objectPath.split('.').slice(1).join('.'),
        [objectPath],
    )

    const isCustomFieldObject = suffixPath.includes('custom_fields')
    const isQaScoreFieldObject = suffixPath.includes('qa_score_dimensions')

    const qaScoreDimension = useMemo(
        () => getQaScoreDimensionFromObjectPath(suffixPath),
        [suffixPath],
    )

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
            (isCustomFieldObject && f.get('path') === 'custom_fields') ||
            (isQaScoreFieldObject && f.get('path') === 'qa_score_dimensions'),
    ) as Map<any, any>

    return (
        <>
            <Button className="btn-frozen" tag="div" size="sm" color="primary">
                {field
                    ? field.get('title')
                    : _capitalize(humanizeString(suffixPath))}
            </Button>
            {isQaScoreFieldObject && (
                <QAScoreSelect
                    value={qaScoreDimension}
                    onChange={onQAScoreDimensionFieldChange}
                />
            )}
            {isCustomFieldObject && (
                <CustomFieldSelect
                    value={customFieldId}
                    onChange={onCustomFieldChange}
                    showManagedFields={true}
                />
            )}
        </>
    )
}
