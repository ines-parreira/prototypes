import classnames from 'classnames'
import moment from 'moment'
import React, {MouseEvent} from 'react'

import Loader from '../../../common/components/Loader/Loader'
import BodyCell from '../../../common/components/table/cells/BodyCell'
import HeaderCell from '../../../common/components/table/cells/HeaderCell'
import HeaderCellProperty from '../../../common/components/table/cells/HeaderCellProperty'
import TableBody from '../../../common/components/table/TableBody'
import TableBodyRow from '../../../common/components/table/TableBodyRow'
import TableHead from '../../../common/components/table/TableHead'
import TableWrapper from '../../../common/components/table/TableWrapper'
import {LanguageList} from '../../../common/components/LanguageBulletList'
import {HelpCenter, HelpCenterLocale} from '../../../../models/helpCenter/types'
import ToggleButton from '../../../common/components/ToggleButton'

import css from './HelpCenterTable.less'

type HelpCentersTableProps = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: HelpCenterLocale
    }
    onToggle: (helpCenterId: number, toggle: boolean) => void
    onClick: (helpCenterId: number) => void
    // loadingHelpCenters: {[key: number]: boolean}
}

export function HelpCentersTable({
    isLoading,
    list,
    locales,
    onToggle,
    onClick,
}: HelpCentersTableProps) {
    const handleToggle = (helpCenterId: number) => (
        isToggled: boolean,
        event?: MouseEvent
    ): void => {
        event?.stopPropagation()
        onToggle(helpCenterId, isToggled)
    }

    return (
        <TableWrapper>
            <TableHead className={css.tableHead}>
                <HeaderCellProperty title="Help Center name" />
                <HeaderCellProperty title="Languages" />
                <HeaderCellProperty title="Last updated" />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {isLoading ? (
                    <TableBodyRow>
                        <BodyCell colSpan={4}>
                            <Loader />
                        </BodyCell>
                    </TableBodyRow>
                ) : (
                    list.map(
                        ({
                            id,
                            name,
                            default_locale,
                            supported_locales,
                            deactivated_datetime,
                            updated_datetime,
                        }) => {
                            const activated = !Boolean(deactivated_datetime)
                            return (
                                <TableBodyRow
                                    className={css.tableBodyRow}
                                    key={id}
                                    onClick={() => onClick(id)}
                                >
                                    <BodyCell className={css.helpCenterName}>
                                        {name}
                                    </BodyCell>
                                    <BodyCell>
                                        <LanguageList
                                            helpcenterId={id}
                                            defaultLanguage={
                                                locales[default_locale]
                                            }
                                            languageList={supported_locales.map(
                                                (code) => locales[code]
                                            )}
                                        />
                                    </BodyCell>
                                    <BodyCell>
                                        {moment(updated_datetime).format('L')}
                                    </BodyCell>
                                    <BodyCell
                                        className={classnames(
                                            'smallest',
                                            css.actions
                                        )}
                                    >
                                        <ToggleButton
                                            value={activated}
                                            onChange={handleToggle(id)}
                                        />
                                        <i
                                            className={classnames(
                                                'material-icons',
                                                css.forwardIcon
                                            )}
                                        >
                                            keyboard_arrow_right
                                        </i>
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        }
                    )
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default HelpCentersTable
