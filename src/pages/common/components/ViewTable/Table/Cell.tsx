import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {EntityType} from 'models/view/types'

import {defaultCell, getConfigByName} from 'config/views'
import {RenderLabel} from 'pages/common/utils/labels'

import css from 'pages/common/components/ViewTable/Table.less'

type Props = {
    field: Map<any, any>
    item?: Map<any, any>
    itemUrl?: string | null
    onClick?: (item: Map<any, any>) => void
    type: EntityType
}

const Cell = ({field, item = fromJS({}), itemUrl, onClick, type}: Props) => {
    const config = getConfigByName(type)

    const labelValue = useMemo(() => {
        const cellRenderFunction = config.get('cell') as typeof defaultCell
        return cellRenderFunction(field.get('name') as string, item)
    }, [config, field, item])

    return (
        <td className={css['limit-overflow']}>
            {itemUrl ? (
                <Link to={itemUrl} onClick={() => onClick?.(item)}>
                    <div className="cell-wrapper">
                        <RenderLabel field={field} value={labelValue} />
                    </div>
                </Link>
            ) : onClick ? (
                <div className="cell-wrapper" onClick={() => onClick(item)}>
                    <RenderLabel field={field} value={labelValue} />
                </div>
            ) : (
                <div className="cell-wrapper">
                    <RenderLabel field={field} value={labelValue} />
                </div>
            )}
        </td>
    )
}

export default Cell
