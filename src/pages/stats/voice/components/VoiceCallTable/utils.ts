import {ComponentProps} from 'react'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {VoiceCallTableColumnName, tableColumns} from './constants'

export type Cell<T extends typeof BodyCell | typeof HeaderCellProperty> = {
    key: VoiceCallTableColumnName
    props: ComponentProps<T>
}

export const filterAndOrderCells = <
    T extends typeof BodyCell | typeof HeaderCellProperty
>(
    allColumns: Record<VoiceCallTableColumnName, Pick<Cell<T>, 'props'>>,
    requiredColumns: VoiceCallTableColumnName[] = tableColumns.default
): Cell<T>[] => {
    const result = requiredColumns.map((columnName) => {
        const cellProps = allColumns[columnName]
        const cell = {
            ...cellProps,
            key: columnName,
        }

        return cell
    })

    return result
}
