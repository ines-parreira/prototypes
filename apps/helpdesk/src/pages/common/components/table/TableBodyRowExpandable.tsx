import type { ComponentProps, FC } from 'react'
import React, { useState } from 'react'

import { SCREEN_SIZE, useScreenSize } from '@repo/hooks'
import classnames from 'classnames'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/common/components/table/TableBodyRowExpandable.less'

export type WithChildren<T> = T & { children: WithChildren<T>[] }

type Props<T, K> = {
    tableBodyRowProps?: Omit<ComponentProps<typeof TableBodyRow>, 'children'>
    level?: number
    RowContentComponent: FC<T & { tableProps: K }>
    rowContentProps: WithChildren<T & { onClick?: () => void }>
    innerClassName?: string
    isDefaultExpanded?: boolean
    onClickCallback?: () => void
    lazyLoadChildren?: boolean
    SkeletonComponent?: FC
    isLoading?: boolean
    tableProps: K
}

export const COLUMN_WIDTH = 24
export const MOBILE_COLUMN_WIDTH = 10

export const TableBodyRowExpandable = <T, K>({
    level = 0,
    tableBodyRowProps,
    RowContentComponent,
    rowContentProps,
    innerClassName,
    isDefaultExpanded = false,
    onClickCallback,
    lazyLoadChildren,
    SkeletonComponent,
    isLoading,
    tableProps,
}: Props<T, K>) => {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded)
    const toggleExpand = () => {
        setIsExpanded(!isExpanded)
        onClickCallback?.()
    }
    const isMobile = useScreenSize() === SCREEN_SIZE.SMALL

    return (
        <>
            <TableBodyRow {...tableBodyRowProps}>
                <BodyCell
                    onClick={toggleExpand}
                    width={COLUMN_WIDTH}
                    style={{ border: 0 }}
                    innerStyle={{
                        left: `${
                            level *
                            (isMobile ? MOBILE_COLUMN_WIDTH : COLUMN_WIDTH)
                        }px`,
                    }}
                    innerClassName={classnames(css.expandCell, innerClassName)}
                >
                    {(rowContentProps.children.length > 0 ||
                        lazyLoadChildren) && (
                        <i
                            className={classnames(
                                'material-icons-round',
                                css['comfortable'],
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
                    tableProps={tableProps}
                />
            </TableBodyRow>
            {isExpanded && (
                <>
                    {lazyLoadChildren && isLoading && SkeletonComponent && (
                        <SkeletonComponent />
                    )}
                    {(!lazyLoadChildren || !isLoading) &&
                        rowContentProps.children.map((tag, index) => (
                            <TableBodyRowExpandable<T, K>
                                key={index}
                                level={level + 1}
                                RowContentComponent={RowContentComponent}
                                rowContentProps={{
                                    ...rowContentProps,
                                    ...tag,
                                    onClick: toggleExpand,
                                }}
                                tableProps={tableProps}
                            />
                        ))}
                </>
            )}
        </>
    )
}
