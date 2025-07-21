import { CardTitle } from 'pages/aiAgent/Onboarding/components/Card'
import { Subtitle } from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'

import css from './ResourcesSection.less'

export const ResourcesSection = () => {
    return (
        <div>
            <div className={css.titleContainer}>
                <CardTitle>Resources</CardTitle>
                <Subtitle>
                    Discover expert tips and actionable strategies to enhance
                    your AI Agent’s performance.
                </Subtitle>
            </div>
            <div data-candu-id="ai-agent-overview-educational-resources"></div>
        </div>
    )
}
