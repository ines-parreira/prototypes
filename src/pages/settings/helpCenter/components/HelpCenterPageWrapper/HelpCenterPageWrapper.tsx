import React, {ReactNode, useMemo, useState} from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'
import {Link, useHistory} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {HelpCenter} from 'models/helpCenter/types'
import PageHeader from 'pages/common/components/PageHeader'

import {getViewLanguage, changeViewLanguage} from 'state/ui/helpCenter'

import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {validLocaleCode} from 'models/helpCenter/utils'

import settingsCss from 'pages/settings/settings.less'
import {getHasAutomate} from 'state/billing/selectors'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {TicketChannel} from 'business/types/ticket'
import Tooltip from 'pages/common/components/Tooltip'
import {FeatureFlagKey} from 'config/featureFlags'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {getAbsoluteUrl, getHelpCenterDomain} from '../../utils/helpCenter.utils'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'

import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import PendingChangesModal from '../PendingChangesModal'
import {LanguageSelect} from '../LanguageSelect/LanguageSelect'
import css from './HelpCenterPageWrapper.less'

const TOOLTIP_TARGET_ID = 'preview-help-center'

type Props = {
    helpCenter: HelpCenter
    children?: ReactNode
    fluidContainer?: boolean
    showLanguageSelector?: boolean
    className?: string
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
    const hasAutomate = useAppSelector(getHasAutomate)
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const helpCenterUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)

        return getAbsoluteUrl({domain, locale: viewLanguage})
    }, [helpCenter, viewLanguage])

    const handleOnChangeLocale = (value: React.ReactText) => {
        if (isDirty) {
            setShowCloseModal(true)
            setLocale(validLocaleCode(value))
            return
        }
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

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

    const {isPassingRulesCheck} = useAbilityChecker()
    const cannotUpdateHelpCenter = !isPassingRulesCheck(({can}) =>
        can('update', 'HelpCenterEntity')
    )

    return (
        <div className="full-width" style={{position: 'relative'}}>
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                    />
                }
            >
                <div className={css.header}>
                    {!changeAutomateSettingButtomPosition &&
                        (hasAutomate ? (
                            helpCenter.shop_name ? (
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    onClick={() => {
                                        history.push(
                                            `/app/automation/shopify/${
                                                helpCenter.shop_name as string
                                            }/connected-channels?type=${
                                                TicketChannel.HelpCenter
                                            }&id=${helpCenter.id}`,
                                            {from: 'help-center-settings'}
                                        )
                                    }}
                                >
                                    <ButtonIconLabel icon="bolt">
                                        Go to automate settings
                                    </ButtonIconLabel>
                                </Button>
                            ) : (
                                <Button
                                    fillStyle="ghost"
                                    intent="primary"
                                    onClick={() => {
                                        if (isConnectStoreLinkEnabled) {
                                            history.push(
                                                `/app/settings/help-center/${helpCenter.id}/publish-track`
                                            )
                                        }
                                    }}
                                >
                                    <ButtonIconLabel
                                        icon="warning"
                                        className={css.connectStoreWarning}
                                    >
                                        Connect store to enable Automate
                                    </ButtonIconLabel>
                                </Button>
                            )
                        ) : (
                            <>
                                <AutomateSubscriptionButton
                                    fillStyle="ghost"
                                    label="Upgrade your help center with automate"
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
                                '_blank'
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
                isConnectStoreLinkEnabled={isConnectStoreLinkEnabled}
            />
            {fluidContainer ? (
                <Container
                    fluid
                    className={classNames(settingsCss.pageContainer, className)}
                >
                    <div className={wrapperClassName}>{children}</div>
                </Container>
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
