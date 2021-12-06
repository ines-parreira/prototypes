import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {validLocaleCode} from '../../../../../models/helpCenter/utils'
import {
    changeViewLanguage,
    getViewLanguage,
} from '../../../../../state/helpCenter/ui'
import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import SelectField from '../../../../common/forms/SelectField/SelectField'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import {useCurrentHelpCenter} from '../../hooks/useCurrentHelpCenter'
import {useLocales} from '../../hooks/useLocales'
import {HelpCenterTranslation} from '../../providers/HelpCenterTranslation'
import {getLocaleSelectOptions} from '../../utils/localeSelectOptions'
import {HelpCenterDetailsBreadcrumb} from '../HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from '../HelpCenterNavigation'
import settingsCss from '../../../settings.less'

import ChatApplication from './components/ChatApplication'
import ChatContactInfoSection from './components/ChatContactInfoSection'
import EmailContactInfoSection from './components/EmailContactInfoSection'
import FooterActions from './components/FooterActions'
import PhoneContactInfoSection from './components/PhoneContactInfoSection'
import css from './HelpCenterContactView.less'

const HelpCenterContactView: React.FC = () => {
    const dispatch = useAppDispatch()
    const locales = useLocales()
    const {helpCenter} = useCurrentHelpCenter()
    const viewLanguage =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const supportedLocales = useMemo(
        () =>
            getLocaleSelectOptions(
                locales,
                helpCenter?.supported_locales || []
            ),
        [locales, helpCenter]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        dispatch(changeViewLanguage(validLocaleCode(value)))
    }

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter.name}
                        activeLabel="Contact"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenter.id} />
            <HelpCenterTranslation helpCenter={helpCenter}>
                <Container fluid className={settingsCss.pageContainer}>
                    <div className={settingsCss.contentWrapper}>
                        <section>
                            <div className={css.heading}>
                                <div>
                                    <h3>Chat Widget</h3>
                                    <p>
                                        This chat integration is going to be
                                        displayed as a widget on every page of
                                        your help center.
                                    </p>
                                </div>
                                <SelectField
                                    value={viewLanguage}
                                    onChange={handleOnChangeLocale}
                                    options={supportedLocales}
                                    className={css.select}
                                />
                            </div>
                            <ChatApplication />
                        </section>

                        <section>
                            <div className={css.heading}>
                                <div>
                                    <h3>Contact cards</h3>
                                    <p>
                                        This section is displayed in your home
                                        page after the articles and before the
                                        footer.
                                    </p>
                                </div>
                                <SelectField
                                    value={viewLanguage}
                                    onChange={handleOnChangeLocale}
                                    options={supportedLocales}
                                    className={css.select}
                                />
                            </div>
                        </section>
                        <EmailContactInfoSection />
                        <PhoneContactInfoSection />
                        <ChatContactInfoSection />
                        <FooterActions />
                    </div>
                </Container>
            </HelpCenterTranslation>
        </div>
    )
}

export default HelpCenterContactView
