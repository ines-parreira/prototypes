import React, { ReactNode, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'
import { Link, useHistory } from 'react-router-dom'

import { LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { HelpCenter } from 'models/helpCenter/types'
import { validLocaleCode } from 'models/helpCenter/utils'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import PageHeader from 'pages/common/components/PageHeader'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import settingsCss from 'pages/settings/settings.less'
import { changeViewLanguage, getViewLanguage } from 'state/ui/helpCenter'

import { HELP_CENTER_DEFAULT_LOCALE } from '../../constants'
import { useAbilityChecker } from '../../hooks/useHelpCenterApi'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../utils/helpCenter.utils'
import { HelpCenterDetailsBreadcrumb } from '../HelpCenterDetailsBreadcrumb'
import { HelpCenterNavigation } from '../HelpCenterNavigation'
import { LanguageSelect } from '../LanguageSelect/LanguageSelect'
import PendingChangesModal from '../PendingChangesModal'

import css from './HelpCenterPageWrapper.less'

const TOOLTIP_TARGET_ID = 'preview-help-center'

type Props = {
    helpCenter: HelpCenter
    children?: ReactNode
    fluidContainer?: boolean
    showLanguageSelector?: boolean
    className?: string
    pageWrapperClassName?: string
    wrapperClassName?: string
    isDirty?: boolean
    onSaveChanges?: () => Promise<void>
    isConnectStoreLinkEnabled?: boolean
}

export const HelpCenterPageWrapper: React.FC<Props> = ({
    helpCenter,
    children,
    fluidContainer = true,
    showLanguageSelector = false,
    className,
    pageWrapperClassName,
    wrapperClassName = settingsCss.contentWrapper,
    isDirty,
    onSaveChanges,
    isConnectStoreLinkEnabled = true,
}: Props) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [locale, setLocale] = useState(viewLanguage)
    const { hasAccess } = useAiAgentAccess(helpCenter.shop_name || undefined)
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const helpCenterUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)

        return getAbsoluteUrl({ domain, locale: viewLanguage })
    }, [helpCenter, viewLanguage])

    const handleOnChangeLocale = (value: React.ReactText) => {
        if (isDirty) {
            setShowCloseModal(true)
            setLocale(validLocaleCode(value))
            return
        }
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    const changeAutomateSettingButtomPosition = useFlag(
        FeatureFlagKey.ChangeAutomateSettingButtomPosition,
    )

    const onDiscard = () => {
        dispatch(changeViewLanguage(locale))
        setShowCloseModal(false)
    }

    const onSave = !onSaveChanges
        ? null
        : async () => {
              try {
                  await onSaveChanges()
              } finally {
                  setShowCloseModal(false)
              }
          }

    const onContinueEditing = () => {
        setShowCloseModal(false)
    }

    const { isPassingRulesCheck } = useAbilityChecker()
    const cannotUpdateHelpCenter = !isPassingRulesCheck(({ can }) =>
        can('update', 'HelpCenterEntity'),
    )

    return (
        <div
            className={classNames('full-width', pageWrapperClassName)}
            style={{ position: 'relative' }}
        >
            <PageHeader
                className={css.pageHeader}
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                    />
                }
            >
                <div className={css.header}>
                    {!changeAutomateSettingButtomPosition &&
                        (hasAccess ? (
                            !helpCenter.shop_name && (
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    onClick={() => {
                                        if (isConnectStoreLinkEnabled) {
                                            history.push(
                                                `/app/settings/help-center/${helpCenter.id}/publish-track`,
                                            )
                                        }
                                    }}
                                >
                                    <ButtonIconLabel
                                        icon="warning"
                                        className={css.connectStoreWarning}
                                    >
                                        Connect store to enable AI Agent
                                    </ButtonIconLabel>
                                </Button>
                            )
                        ) : (
                            <>
                                <AutomateSubscriptionButton
                                    fillStyle="ghost"
                                    label="Upgrade your help center with AI Agent"
                                    onClick={() =>
                                        setIsAutomationModalOpened(true)
                                    }
                                />
                                <AutomateSubscriptionModal
                                    confirmLabel="Subscribe"
                                    isOpen={isAutomationModalOpened}
                                    onClose={() =>
                                        setIsAutomationModalOpened(false)
                                    }
                                />
                            </>
                        ))}
                    {showLanguageSelector && (
                        <LanguageSelect
                            value={viewLanguage}
                            onChange={handleOnChangeLocale}
                            className={css.languageSelector}
                        />
                    )}
                    {!!helpCenter.deactivated_datetime ? (
                        <Tooltip
                            placement="bottom"
                            target={TOOLTIP_TARGET_ID}
                            autohide={false}
                        >
                            <div className={css.tooltipContainer}>
                                Your Help Center must be{' '}
                                <Link
                                    to={`/app/settings/help-center/${helpCenter.id}/publish-track`}
                                >
                                    published
                                </Link>{' '}
                                to view it.
                            </div>
                        </Tooltip>
                    ) : null}
                    <Button
                        aria-label="help center preview"
                        intent="secondary"
                        isDisabled={!!helpCenter.deactivated_datetime}
                        id={TOOLTIP_TARGET_ID}
                        onClick={() => {
                            const windowRef = window.open(
                                helpCenterUrl,
                                '_blank',
                            )
                            windowRef?.focus()
                        }}
                    >
                        <i className="material-icons">open_in_new</i>
                        <span>View Help Center</span>
                    </Button>
                </div>
            </PageHeader>
            <HelpCenterNavigation
                cannotUpdateHelpCenter={cannotUpdateHelpCenter}
                helpCenterId={helpCenter.id}
                helpCenterShopName={helpCenter.shop_name}
            />
            {fluidContainer ? (
                <div
                    className={classNames(settingsCss.pageContainer, className)}
                >
                    <div className={wrapperClassName}>{children}</div>
                </div>
            ) : (
                children
            )}

            {onSave && (
                <PendingChangesModal
                    show={showCloseModal}
                    onSave={onSave}
                    onDiscard={onDiscard}
                    onContinueEditing={onContinueEditing}
                    when={!!isDirty}
                />
            )}
        </div>
    )
}

export default HelpCenterPageWrapper
