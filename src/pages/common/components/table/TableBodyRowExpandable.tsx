import classnames from 'classnames'
import React, {ComponentProps, FC, useState} from 'react'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/common/components/table/TableBodyRowExpandable.less'

export type WithChildren<T> = T & {children: WithChildren<T>[]}

type Props<T> = {
    tableBodyRowProps?: ComponentProps<typeof TableBodyRow>
    level?: number
    RowContentComponent: FC<T>
    rowContentProps: WithChildren<T & {onClick?: () => void}>
    innerClassName?: string
}

export const TableBodyRowExpandable = <T,>({
    level = 0,
    tableBodyRowProps,
    RowContentComponent,
    rowContentProps,
    innerClassName,
}: Props<T>) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const toggleExpand = () => setIsExpanded(!isExpanded)

    return (
        <>
            <TableBodyRow {...tableBodyRowProps}>
                <BodyCell
                    onClick={toggleExpand}
                    width={24}
                    style={{paddingLeft: `${level * 24}px`}}
                    innerClassName={innerClassName}
                >
                    {rowContentProps.children.length > 0 && (
                        <i
                            className={classnames(
                                'material-icons-round',
                                css['comfortable']
                            )}
                        >
                            {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                        </i>
                    )}
                </BodyCell>
                <RowContentComponent
                    {...rowContentProps}
                    onClick={toggleExpand}
                    level={level}
                />
            </TableBodyRow>
            {isExpanded &&
                rowContentProps.children.map((tag, index) => (
                    <TableBodyRowExpandable<T>
                        key={index}
                        level={level + 1}
                        RowContentComponent={RowContentComponent}
                        rowContentProps={{
                            ...tag,
                            onClick: toggleExpand,
                        }}
                    />
                ))}
        </>
    )
}
