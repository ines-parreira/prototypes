import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import css from './GorgiasChatIntegrationLanguagesTable.less'

export type GorgiasChatIntegrationLanguagesTableProps = {
    children: React.ReactNode
}

export const GorgiasChatIntegrationLanguagesTable = ({
    children,
}: GorgiasChatIntegrationLanguagesTableProps) => (
    <div className="full-width">
        <TableWrapper className={css.table}>
            <TableBody>{children}</TableBody>
        </TableWrapper>
    </div>
)
