import React, {ReactNode, useMemo} from 'react'
import classNames from 'classnames'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import {HelpCenter} from 'models/helpCenter/types'
import PageHeader from 'pages/common/components/PageHeader'
import {getViewLanguage, changeViewLanguage} from 'state/helpCenter/ui'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {validLocaleCode} from '../../../../../models/helpCenter/utils'
import SelectField from '../../../../common/forms/SelectField/SelectField'
import settingsCss from '../../../settings.less'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import {getAbsoluteUrl, getHelpCenterDomain} from '../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'

import css from './HelpCenterPageWrapper.less'

type Props = {
    activeLabel: string
    helpCenter: HelpCenter
    children?: ReactNode
    actions?: ReactNode
    fluidContainer?: boolean
    showLanguageSelector?: boolean
    className?: string
}

export const HelpCenterPageWrapper: React.FC<Props> = ({
    activeLabel,
    helpCenter,
    children,
    actions,
    fluidContainer = true,
    showLanguageSelector = false,
    className,
}: Props) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const helpCenterUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)

        return getAbsoluteUrl({domain, locale: viewLanguage})
    }, [helpCenter, viewLanguage])

    const localeOptions = useMemo(
        () => getLocaleSelectOptions(locales, helpCenter.supported_locales),
        [locales, helpCenter.supported_locales]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel={activeLabel}
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
                        />
                    )}
                    <Button
                        aria-label="help center preview"
                        intent={ButtonIntent.Secondary}
                        type="button"
                        onClick={() =>
                            window.open(helpCenterUrl, '_blank')!.focus()
                        }
                    >
                        <i className="material-icons">open_in_new</i>
                        <span>Preview</span>
                    </Button>
                    {actions}
                </div>
            </PageHeader>
            <HelpCenterNavigation helpCenterId={helpCenter.id} />
            {fluidContainer ? (
                <Container
                    fluid
                    className={classNames(settingsCss.pageContainer, className)}
                >
                    <div className={settingsCss.contentWrapper}>{children}</div>
                </Container>
            ) : (
                children
            )}
        </div>
    )
}

export default HelpCenterPageWrapper
