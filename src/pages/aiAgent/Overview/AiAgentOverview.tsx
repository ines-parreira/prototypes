import React, {useEffect, useState} from 'react'

import {useLocation} from 'react-router-dom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import ThankYouModal from 'pages/aiAgent/Onboarding/components/ThankYouModal/ThankYouModal'

import {KpiSection} from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import {PendingTasksSection} from 'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSection'
import {ResourcesSection} from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import {Separator} from 'pages/aiAgent/Overview/components/Separator/Separator'
import {Title} from 'pages/aiAgent/Overview/components/Title/Title'
import {AiAgentOverviewLayout} from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'

export const AiAgentOverview = () => {
    const [isOpen, setIsOpen] = useState(false)
    const {state}: {state: {from: string}} = useLocation()

    useEffect(() => {
        if (state?.from) {
            setIsOpen(state?.from === '/app/ai-agent/onboarding')
        }
    }, [state])

    return (
        <AiAgentOverviewLayout>
            <Title firstName="Taylor" />
            <KpiSection />
            <PendingTasksSection />
            <Separator />
            <ResourcesSection />
            <ThankYouModal
                isOpen={isOpen}
                title="Your account is ready!"
                description=""
                image={<img src={modalImage} alt="Thank you" />}
                actionLabel="Go live with AI agent"
                closeLabel="Close"
                onClick={() => setIsOpen(false)}
                onClose={() => setIsOpen(false)}
            />
        </AiAgentOverviewLayout>
    )
}
