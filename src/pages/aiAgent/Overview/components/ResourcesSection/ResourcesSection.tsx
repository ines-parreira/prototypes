import React from 'react'

import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {Subtitle} from 'pages/aiAgent/Onboarding/components/Subtitle/Subtitle'

export const ResourcesSection = () => {
    return (
        <div>
            <div>
                <CardTitle>Resources</CardTitle>
                <Subtitle>
                    Discover expert tips and actionable strategies to enhance
                    your AI Agent’s performance.
                </Subtitle>
            </div>
            <div>{/** div for Candu content **/}</div>
        </div>
    )
}
