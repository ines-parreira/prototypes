import React from 'react'

import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'
import {HelpCenterTranslation} from '../../providers/HelpCenterTranslation'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import ChatApplication from './components/ChatApplication'
import ChatContactInfoSection from './components/ChatContactInfoSection'
import EmailContactInfoSection from './components/EmailContactInfoSection'
import FooterActions from './components/FooterActions'
import PhoneContactInfoSection from './components/PhoneContactInfoSection'

import css from './HelpCenterContactView.less'

const HelpCenterContactView: React.FC = () => {
    const helpCenter = useCurrentHelpCenter()

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            activeLabel="Contact"
            showLanguageSelector
        >
            <HelpCenterTranslation helpCenter={helpCenter}>
                <section>
                    <div className={css.heading}>
                        <div>
                            <h3>Chat Widget</h3>
                            <p>
                                This chat integration is going to be displayed
                                as a widget on every page of your help center.
                            </p>
                        </div>
                    </div>
                    <ChatApplication />
                </section>

                <section>
                    <div className={css.heading}>
                        <div>
                            <h3>Contact cards</h3>
                            <p>
                                This section is displayed in your home page
                                after the articles and before the footer.
                            </p>
                        </div>
                    </div>
                </section>
                <EmailContactInfoSection />
                <PhoneContactInfoSection />
                <ChatContactInfoSection />
                <FooterActions />
            </HelpCenterTranslation>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterContactView
