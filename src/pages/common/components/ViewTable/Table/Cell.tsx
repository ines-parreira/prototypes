import React, { useMemo } from 'react'

import { fromJS, Map } from 'immutable'
import { Link } from 'react-router-dom'

import { defaultCell, getConfigByName } from 'config/views'
import { EntityType } from 'models/view/types'
import css from 'pages/common/components/ViewTable/Table.less'
import { RenderLabel } from 'pages/common/utils/labels'

type Props = {
    field: Map<any, any>
    item?: Map<any, any>
    itemUrl?: string | null
    onClick?: (item: Map<any, any>) => void
    type: EntityType
    colSpan?: number
}

const Cell = ({
    field,
    item = fromJS({}),
    itemUrl,
    onClick,
    type,
    colSpan,
}: Props) => {
    const config = getConfigByName(type)

    const labelValue = useMemo(() => {
        const cellRenderFunction = config.get('cell') as typeof defaultCell
        return cellRenderFunction(field.get('name') as string, item)
    }, [config, field, item])

    return (
        <td colSpan={colSpan} className={css['limit-overflow']}>
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
