import {
    createContext,
    UIEventHandler,
    useCallback,
    useContext,
    useState,
} from 'react'

import classNames from 'classnames'

import { OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import analyticsTableCss from 'pages/stats/common/components/Table/AnalyticsTable.less'

const useIsHorizontalScrolled = () => {
    const [isScrolled, setIsScrolled] = useState(false)

    const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            const isScrolled = event.currentTarget.scrollLeft > 0
            setIsScrolled(isScrolled)
        },
        [],
    )

    return { isScrolled, handleScroll }
}

const tableContext = createContext(false)

const useTableContext = () => useContext(tableContext)

export const ProductTable = ({ children }: { children: React.ReactNode }) => {
    const { isScrolled, handleScroll } = useIsHorizontalScrolled()

    return (
        <tableContext.Provider value={isScrolled}>
            <div
                className={analyticsTableCss.container}
                onScroll={handleScroll}
            >
                <TableWrapper
                    className={analyticsTableCss.table}
                    height="comfortable"
                >
                    {children}
                </TableWrapper>
            </div>
        </tableContext.Provider>
    )
}

export const ProductTableHeadCell = ({
    children,
    isSticky,
    width,
    justifyContent = 'right',
    title,
    isOrderedBy = true,
    direction = OrderDirection.Desc,
    onSetSortDirection,
}: {
    children?: React.ReactNode
    title: string
    isOrderedBy?: boolean
    direction?: OrderDirection
    isSticky?: boolean
    width?: number
    justifyContent?: 'left' | 'right'
    onSetSortDirection?: () => void
}) => {
    const isScrolled = useTableContext()

    return (
        <HeaderCellProperty
            isOrderedBy={isOrderedBy}
            direction={direction}
            onClick={onSetSortDirection}
            title={title}
            wrapContent
            height="comfortable"
            width={width}
            justifyContent={justifyContent}
            className={classNames({
                [analyticsTableCss.withShadow]: isSticky && isScrolled,
            })}
        >
            {children}
        </HeaderCellProperty>
    )
}

export const ProductTableBodyCell = ({
    children,
    isLoading,
    isSticky,
    width,
    justifyContent = 'right',
}: {
    children?: React.ReactNode
    isLoading?: boolean
    isSticky?: boolean
    width?: number
    justifyContent?: 'left' | 'right'
}) => {
    const isScrolled = useTableContext()

    return (
        <BodyCell
            style={{ height: 80, padding: 0 }}
            innerStyle={{ paddingTop: 0, paddingBottom: 0 }}
            width={width}
            justifyContent={justifyContent}
            className={classNames({
                [analyticsTableCss.withShadow]: isSticky && isScrolled,
            })}
            isLoading={isLoading}
        >
            {children}
        </BodyCell>
    )
}
