import classnames from 'classnames'
import moment from 'moment'
import React from 'react'

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
// import ToggleButton from '../../../common/components/ToggleButton'

import css from './HelpCenterTable.less'

type OwnProps = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: HelpCenterLocale
    }
    // toggle: (helpCenterId: number, toggle: boolean) => void
    onClick: (helpCenterId: number) => void
    // loadingHelpCenters: {[key: number]: boolean}
}

export function HelpCentersTable({
    isLoading,
    list,
    locales,
    // toggle,
    onClick,
}: // loadingHelpCenters,
OwnProps) {
    // const toggleHelpCenter = (helpCenterId: number) => (
    //     newToggleValue: boolean,
    //     event?: MouseEvent
    // ) => {
    //     event?.stopPropagation()
    //     toggle(helpCenterId, newToggleValue)

    //     return null
    // }

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
                            // deactivated_datetime,
                            updated_datetime,
                        }) => {
                            // const helpCenterEnabled = !Boolean(
                            //     deactivated_datetime
                            // )
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
                                            // TODO : use supported_locale from helpcenter when API will support it
                                            languageList={[
                                                'en-US',
                                                'fr-FR',
                                                'cs-CZ',
                                                'da-DK',
                                                'nl-NL',
                                            ].map((code) => locales[code])}
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
                                        {/* <ToggleButton
                                            value={helpCenterEnabled}
                                            onChange={toggleHelpCenter(id)}
                                            loading={loadingHelpCenters[id]}
                                        /> */}
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
