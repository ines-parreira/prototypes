import React, {MouseEvent} from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {Container} from 'reactstrap'

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
import ToggleInput from 'pages/common/forms/ToggleInput'
import settingsCss from '../../settings.less'

import css from './HelpCenterTable.less'

type Props = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: Locale
    }
    onToggle: (helpCenterId: number, toggle: boolean) => void
    onClick: (helpCenterId: number) => void
}

export const HelpCenterTable: React.FC<Props> = ({
    isLoading,
    list,
    locales,
    onToggle,
    onClick,
}) => {
    const handleToggle =
        (helpCenterId: number) =>
        (isToggled: boolean, event?: MouseEvent<HTMLLabelElement>): void => {
            event?.stopPropagation()
            onToggle(helpCenterId, isToggled)
        }

    if (isLoading) {
        return <Loader />
    }

    if (list.length === 0) {
        return (
            <Container fluid className={settingsCss.py24}>
                <div>You have no Help Center at the moment.</div>
            </Container>
        )
    }

    return (
        <TableWrapper>
            <TableHead className={css.tableHead}>
                <HeaderCell size="smallest" />
                <HeaderCellProperty title="Help Center name" />
                <HeaderCellProperty title="Languages" />
                <HeaderCellProperty title="Last updated" />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {list.map(
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
                                <BodyCell
                                    size="smallest"
                                    className={css.actions}
                                >
                                    <ToggleInput
                                        isToggled={activated}
                                        onClick={handleToggle(id)}
                                    />
                                </BodyCell>
                                <BodyCell className={css.helpCenterName}>
                                    {name}
                                </BodyCell>
                                <BodyCell size="small">
                                    <LanguageList
                                        id={id}
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
                )}
            </TableBody>
        </TableWrapper>
    )
}

export default HelpCenterTable
