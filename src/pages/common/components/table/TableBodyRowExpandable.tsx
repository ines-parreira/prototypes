import classnames from 'classnames'
import React, {ComponentProps, FC, useState} from 'react'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/common/components/table/TableBodyRowExpandable.less'
import {SCREEN_SIZE, useScreenSize} from 'hooks/useScreenSize'

export type WithChildren<T> = T & {children: WithChildren<T>[]}

type Props<T> = {
    tableBodyRowProps?: Omit<ComponentProps<typeof TableBodyRow>, 'children'>
    level?: number
    RowContentComponent: FC<T>
    rowContentProps: WithChildren<T & {onClick?: () => void}>
    innerClassName?: string
    isDefaultExpanded?: boolean
}

export const COLUMN_WIDTH = 24
export const MOBILE_COLUMN_WIDTH = 10

export const TableBodyRowExpandable = <T,>({
    level = 0,
    tableBodyRowProps,
    RowContentComponent,
    rowContentProps,
    innerClassName,
    isDefaultExpanded = false,
}: Props<T>) => {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded)
    const toggleExpand = () => setIsExpanded(!isExpanded)
    const isMobile = useScreenSize() === SCREEN_SIZE.SMALL

    return (
        <>
            <TableBodyRow {...tableBodyRowProps}>
                <BodyCell
                    onClick={toggleExpand}
                    width={COLUMN_WIDTH}
                    style={{border: 0}}
                    innerStyle={{
                        left: `${
                            level *
                            (isMobile ? MOBILE_COLUMN_WIDTH : COLUMN_WIDTH)
                        }px`,
                    }}
                    innerClassName={classnames(css.expandCell, innerClassName)}
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
                            ...rowContentProps,
                            ...tag,
                            onClick: toggleExpand,
                        }}
                    />
                ))}
        </>
    )
}
