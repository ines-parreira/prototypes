import React from 'react'

import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {useHelpCenterTranslation} from '../../providers/HelpCenterTranslation'
import CloseTabModal from '../CloseTabModal'
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
        >
            <ContactFormInfoSection helpCenter={helpCenter} />
            <ChatApplication helpCenterId={helpCenter.id} />
            <PhoneContactInfoSection />
            <FooterActions />
            <CloseTabModal onSave={updateHelpCenter} when={isDirty} />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterContactView
