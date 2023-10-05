import React, {MouseEvent, useCallback} from 'react'
import moment from 'moment'

import {HelpCenter, Locale} from 'models/helpCenter/types'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import Loader from 'pages/common/components/Loader/Loader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import IconButton from '../../../common/components/button/IconButton'
import css from './HelpCenterTable.less'
import StoreName from './StoreName'

type Props = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: Locale
    }
    onClick: (helpCenter: HelpCenter) => void
    duplicateHelpCenter: (helpCenter: HelpCenter) => void
}

export const HelpCenterTable: React.FC<Props> = ({
    isLoading,
    list,
    locales,
    onClick,
    duplicateHelpCenter,
}) => {
    const handleDuplicate = useCallback(
        (helpCenter: HelpCenter, event: MouseEvent): void => {
            event.stopPropagation()

            duplicateHelpCenter(helpCenter)
        },
        [duplicateHelpCenter]
    )

    if (isLoading) {
        return <Loader />
    }

    return (
        <TableWrapper className={css.tableWrapper}>
            <TableHead className={css.tableHead}>
                <HeaderCellProperty
                    className={css.headerHelpCenterName}
                    title="Help Center name"
                />
                <HeaderCellProperty title="Store" />
                <HeaderCellProperty title="Languages" />
                <HeaderCellProperty title="Last updated" />
                <HeaderCell />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {list.map((helpCenter) => {
                    const {id} = helpCenter

                    return (
                        <TableBodyRow
                            className={css.tableBodyRow}
                            key={id}
                            onClick={() => onClick(helpCenter)}
                        >
                            <BodyCell className={css.helpCenterName}>
                                {helpCenter.name}
                            </BodyCell>
                            <BodyCell className={css.storeName}>
                                <StoreName name={helpCenter.shop_name} />
                            </BodyCell>
                            <BodyCell size="small">
                                <LanguageList
                                    id={id}
                                    defaultLanguage={
                                        locales[helpCenter.default_locale]
                                    }
                                    languageList={helpCenter.supported_locales
                                        .filter((code) => locales[code])
                                        .map((code) => locales[code])}
                                />
                            </BodyCell>
                            <BodyCell>
                                {moment(helpCenter.updated_datetime).format(
                                    'L'
                                )}
                            </BodyCell>

                            <BodyCell>
                                <IconButton
                                    className="mr-1"
                                    fillStyle="ghost"
                                    intent="secondary"
                                    onClick={(event) =>
                                        handleDuplicate(helpCenter, event)
                                    }
                                    title="Duplicate Help Center"
                                >
                                    file_copy
                                </IconButton>
                            </BodyCell>
                            <BodyCell className={css.lastBodyCell}>
                                <IconButton
                                    className="mr-1"
                                    fillStyle="ghost"
                                    intent="secondary"
                                    onClick={() => onClick(helpCenter)}
                                    title="Open Help Center"
                                >
                                    chevron_right
                                </IconButton>
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}

export default HelpCenterTable
