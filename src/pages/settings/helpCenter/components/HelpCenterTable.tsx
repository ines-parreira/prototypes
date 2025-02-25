import React, { MouseEvent, useCallback } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    HelpCenter,
    HelpCenterCreationWizardStep,
    Locale,
} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import { LanguageTagList } from 'pages/common/components/LanguageTagList'
import Loader from 'pages/common/components/Loader/Loader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import IconButton from '../../../common/components/button/IconButton'
import StoreName from './StoreName'

import css from './HelpCenterTable.less'

type Props = {
    isLoading: boolean
    list: HelpCenter[]
    locales: {
        [key: string]: Locale
    }
    onClick: (
        helpCenter: HelpCenter,
        shouldNavigateToWizardCreation?: boolean,
    ) => void
    duplicateHelpCenter: (helpCenter: HelpCenter) => void
}

export const HelpCenterTable: React.FC<Props> = ({
    isLoading,
    list,
    locales,
    onClick,
    duplicateHelpCenter,
}) => {
    const helpCenterCreationWizard =
        useFlags()[FeatureFlagKey.HelpCenterCreationWizard] || false

    const handleDuplicate = useCallback(
        (helpCenter: HelpCenter, event: MouseEvent): void => {
            event.stopPropagation()

            duplicateHelpCenter(helpCenter)
        },
        [duplicateHelpCenter],
    )

    const isHelpCenterCreationWizardInProgress = useCallback(
        (helpCenter: HelpCenter): boolean => {
            return !!(
                helpCenterCreationWizard &&
                helpCenter?.wizard &&
                !helpCenter.wizard.completed
            )
        },
        [helpCenterCreationWizard],
    )

    const handleNextPage = useCallback(
        (helpCenter: HelpCenter): void => {
            const shouldNavigateToWizardCreation =
                isHelpCenterCreationWizardInProgress(helpCenter)

            onClick(helpCenter, shouldNavigateToWizardCreation)
        },
        [onClick, isHelpCenterCreationWizardInProgress],
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
                    const { id } = helpCenter
                    const isHCWizardInProgress =
                        isHelpCenterCreationWizardInProgress(helpCenter)

                    return (
                        <TableBodyRow
                            className={css.tableBodyRow}
                            key={id}
                            onClick={() => handleNextPage(helpCenter)}
                        >
                            <BodyCell className={css.helpCenterName}>
                                {helpCenter.name}
                            </BodyCell>
                            <BodyCell className={css.storeName}>
                                <StoreName name={helpCenter.shop_name} />
                            </BodyCell>
                            <BodyCell size="small">
                                <LanguageTagList
                                    id={id}
                                    defaultLanguage={
                                        locales[helpCenter.default_locale]
                                    }
                                    languageList={helpCenter.supported_locales
                                        .filter((code) => locales[code])
                                        .map((code) => locales[code])}
                                />
                            </BodyCell>
                            <BodyCell innerClassName={css.bodyCell}>
                                {moment(helpCenter.updated_datetime).format(
                                    'L',
                                )}
                            </BodyCell>

                            <BodyCell innerClassName={css.bodyCell}>
                                {!isHCWizardInProgress && (
                                    <IconButton
                                        className={css.iconButton}
                                        fillStyle="ghost"
                                        intent="secondary"
                                        onClick={(event) =>
                                            handleDuplicate(helpCenter, event)
                                        }
                                        title="Duplicate Help Center"
                                    >
                                        file_copy
                                    </IconButton>
                                )}
                            </BodyCell>

                            <BodyCell
                                className={css.lastBodyCell}
                                innerClassName={classNames(
                                    css.bodyCell,
                                    css.lastBodyCellInner,
                                )}
                            >
                                {isHCWizardInProgress ? (
                                    <Button
                                        fillStyle="ghost"
                                        onClick={() =>
                                            handleNextPage(helpCenter)
                                        }
                                        title="Start Setup"
                                    >
                                        {helpCenter.wizard?.step_name ===
                                        HelpCenterCreationWizardStep.Initialization
                                            ? 'Start Setup'
                                            : 'Continue Setup'}
                                    </Button>
                                ) : (
                                    <IconButton
                                        className={classNames(
                                            css.iconButton,
                                            css.chevronRight,
                                        )}
                                        fillStyle="ghost"
                                        intent="secondary"
                                        onClick={() =>
                                            handleNextPage(helpCenter)
                                        }
                                        title="Open Help Center"
                                    >
                                        chevron_right
                                    </IconButton>
                                )}
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}

export default HelpCenterTable
