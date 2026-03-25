import { useRef } from 'react'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import { CardTitle } from 'pages/aiAgent/components/Card'
import { Subtitle } from 'pages/aiAgent/components/Subtitle/Subtitle'

import css from './ResourcesSection.less'

export const ResourcesSection = () => {
    const canduRef = useRef<HTMLDivElement>(null)
    useInjectStyleToCandu(canduRef.current)

    return (
        <div>
            <div className={css.titleContainer}>
                <CardTitle>Resources</CardTitle>
                <Subtitle>
                    Discover expert tips and actionable strategies to enhance
                    your AI Agent’s performance.
                </Subtitle>
            </div>
            <div
                ref={canduRef}
                data-candu-id="ai-agent-overview-educational-resources"
            ></div>
        </div>
    )
}
