import React from 'react'

import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {useHelpCenterTranslation} from '../../providers/HelpCenterTranslation'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import ChatApplication from './components/ChatApplication'
import ContactFormInfoSection from './components/ContactFormInfoSection'
import FooterActions from './components/FooterActions'
import PhoneContactInfoSection from './components/PhoneContactInfoSection'

import css from './HelpCenterContactView.less'

const HelpCenterContactView: React.FC = () => {
    const helpCenter = useCurrentHelpCenter()
    const {isDirty, updateHelpCenter} = useHelpCenterTranslation()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            showLanguageSelector
            wrapperClassName={css.contentWrapper}
            isDirty={isDirty}
            onSaveChanges={updateHelpCenter}
        >
            <ContactFormInfoSection />
            <ChatApplication />
            <PhoneContactInfoSection />
            <FooterActions />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterContactView
