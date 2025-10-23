import { history } from '@repo/routing'

import { Badge } from 'gorgias-design-system/Badge/Badge'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import { GorgiasChatIntegrationLanguagesTableRowActions } from './GorgiasChatIntegrationLanguagesTableRowActions'
import type { LanguageItemRow } from './types'

import css from './GorgiasChatIntegrationLanguagesTable.less'

export type GorgiasChatIntegrationLanguagesTableRowProps = {
    language: LanguageItemRow
    onClickDelete?: (language: LanguageItemRow) => void
    onClickSetDefault?: (language: LanguageItemRow) => void
}

export const GorgiasChatIntegrationLanguagesTableRow = ({
    language,
    onClickDelete,
    onClickSetDefault,
}: GorgiasChatIntegrationLanguagesTableRowProps) => {
    return (
        <TableBodyRow>
            <BodyCell
                className={css.language}
                onClick={() => history.push(language.link)}
            >
                {language.label}
                {language.primary && <Badge label="Default" className="ml-3" />}
            </BodyCell>
            <BodyCell size="smallest">
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onClickDelete}
                    onClickSetDefault={onClickSetDefault}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
