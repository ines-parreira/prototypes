import React, {ReactNode, useMemo, useState} from 'react'
import classNames from 'classnames'
import {Container} from 'reactstrap'

import {HelpCenter} from 'models/helpCenter/types'
import PageHeader from 'pages/common/components/PageHeader'

import {getViewLanguage, changeViewLanguage} from 'state/ui/helpCenter'

import Button from 'pages/common/components/button/Button'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {validLocaleCode} from 'models/helpCenter/utils'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import settingsCss from 'pages/settings/settings.less'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getAbsoluteUrl, getHelpCenterDomain} from '../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'

import {useAbilityChecker} from '../../hooks/useHelpCenterApi'
import PendingChangesModal from '../PendingChangesModal'
import css from './HelpCenterPageWrapper.less'

type Props = {
    helpCenter: HelpCenter
    children?: ReactNode
    fluidContainer?: boolean
    showLanguageSelector?: boolean
    className?: string
    wrapperClassName?: string
    isDirty?: boolean
    onSaveChanges?: () => Promise<void>
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
}: Props) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const viewLanguage =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const [showCloseModal, setShowCloseModal] = useState(false)
    const [locale, setLocale] = useState(viewLanguage)

    const helpCenterUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)

        return getAbsoluteUrl({domain, locale: viewLanguage})
    }, [helpCenter, viewLanguage])

    const localeOptions = useMemo(
        () => getLocaleSelectOptions(locales, helpCenter.supported_locales),
        [locales, helpCenter.supported_locales]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        if (isDirty) {
            setShowCloseModal(true)
            setLocale(validLocaleCode(value))
            return
        }
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

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
                    {showLanguageSelector && (
                        <SelectField
                            value={viewLanguage}
                            options={localeOptions}
                            onChange={handleOnChangeLocale}
                            aria-label="language selector"
                            className={css.languageSelector}
                        />
                    )}
                    <Button
                        aria-label="help center preview"
                        intent="secondary"
                        onClick={() =>
                            window.open(helpCenterUrl, '_blank')!.focus()
                        }
                    >
                        <i className="material-icons">open_in_new</i>
                        <span>Preview</span>
                    </Button>
                </div>
            </PageHeader>
            <HelpCenterNavigation
                cannotUpdateHelpCenter={cannotUpdateHelpCenter}
                helpCenterId={helpCenter.id}
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
