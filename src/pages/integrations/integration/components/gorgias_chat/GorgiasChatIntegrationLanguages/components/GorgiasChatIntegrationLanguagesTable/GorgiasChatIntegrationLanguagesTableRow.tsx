import React from 'react'

import {Badge} from 'gorgias-design-system/Badge/Badge'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import history from 'pages/history'

import {GorgiasChatIntegrationLanguagesTableRowActions} from './GorgiasChatIntegrationLanguagesTableRowActions'
import css from './GorgiasChatIntegrationLanguagesTable.less'
import type {LanguageItemRow} from './types'

export type GorgiasChatIntegrationLanguagesTableRowProps = {
    language: LanguageItemRow
    onClickDelete?: (language: LanguageItemRow) => void
    onClickSetAsDefault?: (language: LanguageItemRow) => void
}

export const GorgiasChatIntegrationLanguagesTableRow = ({
    language,
    onClickDelete,
    onClickSetAsDefault,
}: GorgiasChatIntegrationLanguagesTableRowProps) => {
    return (
        <TableBodyRow onClick={() => history.push(language.link)}>
            <BodyCell className={css.language}>
                {language.label}
                {language.primary && <Badge label="Default" className="ml-3" />}
            </BodyCell>
            <BodyCell size="smallest">
                <GorgiasChatIntegrationLanguagesTableRowActions
                    language={language}
                    onClickDelete={onClickDelete}
                    onClickSetAsDefault={onClickSetAsDefault}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
