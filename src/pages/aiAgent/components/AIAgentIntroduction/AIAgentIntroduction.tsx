import React from 'react'

import css from './AIAgentIntroduction.less'

export const AIAgentIntroduction = () => {
    return (
        <div className={css.container}>
            <p>
                AI Agent uses AI to scan your tickets and only responds when it
                has high confidence in an answer, otherwise it automatically
                hands tickets over to your team. AI Agent uses Help Center
                articles, Macros, Guidance, and Shopify data to deliver accurate
                responses.
            </p>
            {/* get inspiration from "ActionsInfoLinks" for the future documentation links to add here */}
            <div
                className={css.infoLink}
                data-candu-id="automate-links-ai-agent"
            ></div>
        </div>
    )
}
