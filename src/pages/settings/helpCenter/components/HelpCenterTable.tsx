import React, {MouseEvent, useCallback} from 'react'
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

import {useAbilityChecker} from '../hooks/useHelpCenterApi'
import IconButton from '../../../common/components/button/IconButton'
import ConfirmationPopover from '../../../common/components/popover/ConfirmationPopover'
import css from './HelpCenterTable.less'

type Props = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: Locale
    }
    onToggle: (helpCenterId: number, toggle: boolean) => void
    onClick: (helpCenter: HelpCenter) => void
    duplicateHelpCenter: (helpCenter: HelpCenter) => void
    deleteHelpCenter: (helpCenter: HelpCenter) => void
}

export const HelpCenterTable: React.FC<Props> = ({
    isLoading,
    list,
    locales,
    onToggle,
    onClick,
    duplicateHelpCenter,
    deleteHelpCenter,
}) => {
    const handleToggle =
        (helpCenterId: number) =>
        (isToggled: boolean, event?: MouseEvent<HTMLLabelElement>): void => {
            event?.stopPropagation()
            onToggle(helpCenterId, isToggled)
        }

    const handleDuplicate = useCallback(
        (helpCenter: HelpCenter, event: MouseEvent): void => {
            event.stopPropagation()

            duplicateHelpCenter(helpCenter)
        },
        [duplicateHelpCenter]
    )

    const {isPassingRulesCheck} = useAbilityChecker()

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
                {list.map((helpCenter) => {
                    const {id} = helpCenter

                    const activated = !Boolean(helpCenter.deactivated_datetime)

                    return (
                        <TableBodyRow
                            className={css.tableBodyRow}
                            key={id}
                            onClick={() => onClick(helpCenter)}
                        >
                            <BodyCell size="smallest" className={css.actions}>
                                <ToggleInput
                                    isToggled={activated}
                                    onClick={handleToggle(id)}
                                    isDisabled={
                                        !isPassingRulesCheck(({can}) =>
                                            can('update', 'HelpCenterEntity')
                                        )
                                    }
                                />
                            </BodyCell>
                            <BodyCell className={css.helpCenterName}>
                                {helpCenter.name}
                            </BodyCell>
                            <BodyCell size="small">
                                <LanguageList
                                    id={id}
                                    defaultLanguage={
                                        locales[helpCenter.default_locale]
                                    }
                                    languageList={helpCenter.supported_locales.map(
                                        (code) => locales[code]
                                    )}
                                />
                            </BodyCell>
                            <BodyCell>
                                {moment(helpCenter.updated_datetime).format(
                                    'L'
                                )}
                            </BodyCell>

                            <BodyCell className={css.lastBodyCell}>
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

                                <ConfirmationPopover
                                    buttonProps={{
                                        intent: 'destructive',
                                    }}
                                    content={
                                        <>
                                            You are about to delete{' '}
                                            <b>{helpCenter.name}</b>.
                                        </>
                                    }
                                    id={`delete-button-${id}`}
                                    onConfirm={() =>
                                        deleteHelpCenter(helpCenter)
                                    }
                                    placement="left"
                                >
                                    {({uid, onDisplayConfirmation}) => (
                                        <IconButton
                                            className="mr-1"
                                            id={uid}
                                            fillStyle="ghost"
                                            intent="destructive"
                                            onClick={onDisplayConfirmation}
                                            title="Delete Help Center"
                                        >
                                            delete
                                        </IconButton>
                                    )}
                                </ConfirmationPopover>
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}

export default HelpCenterTable
