import React from 'react'

import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HelpCenterTranslationProvider} from '../../providers/HelpCenterTranslation'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import ChatApplication from './components/ChatApplication'
import ContactFormInfoSection from './components/ContactFormInfoSection'
import FooterActions from './components/FooterActions'
import PhoneContactInfoSection from './components/PhoneContactInfoSection'

import css from './HelpCenterContactView.less'

const HelpCenterContactView: React.FC = () => {
    const helpCenter = useCurrentHelpCenter()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            showLanguageSelector
            wrapperClassName={css.contentWrapper}
        >
            <HelpCenterTranslationProvider helpCenter={helpCenter}>
                <ContactFormInfoSection helpCenter={helpCenter} />
                <ChatApplication helpCenterId={helpCenter.id} />
                <PhoneContactInfoSection />
                <FooterActions />
            </HelpCenterTranslationProvider>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterContactView
