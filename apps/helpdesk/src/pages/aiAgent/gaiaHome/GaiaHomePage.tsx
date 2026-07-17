import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Icon, Tag } from '@gorgias/axiom'
import { useCopilot } from '@gorgias/copilot'

import { CategoryLauncher } from './CategoryLauncher'
import { GaiaChatOverlay } from './GaiaChatOverlay'
import { MetricsChartCard } from './MetricsChartCard'
import css from './GaiaHomePage.less'

const OPPORTUNITIES = [
    {
        title: 'Two skills give shoppers different return windows',
        finding: '218 conversations affected last month',
        automationDelta: '8%',
    },
    {
        title: '"Order tracking" resolves below your average',
        finding: 'High volume (1,020 conversations) but 21% success',
        automationDelta: '13%',
    },
]

export function GaiaHomePage() {
    const [inputValue, setInputValue] = useState('')
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { sendPrompt, newThread, abort } = useCopilot()

    const handleSend = () => {
        const message = inputValue.trim()
        if (!message) return

        sendPrompt(message)
        setInputValue('')
        setIsChatOpen(true)
    }

    const handleCloseChat = () => {
        setIsChatOpen(false)
        // Reset so the next message from the homepage starts a fresh thread.
        abort()
        newThread()
    }

    useEffect(() => {
        if (!isChatOpen) return

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleCloseChat()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatOpen])

    return (
        <main className={css.main}>
            <div className={css.surface}>
                <div className={css.content}>
                    <MetricsChartCard />

                    <div className={css.hero}>
                        <div className={css.heroEyebrow}>Welcome back!</div>
                        <h1 className={css.heroTitle}>
                            Let&rsquo;s continue growing your business
                        </h1>
                    </div>

                    <div className={css.askSection}>
                        <div className={css.inputBar}>
                            <span className={css.inputOrb} />
                            <input
                                className={css.inputField}
                                placeholder="Ask anything…"
                                value={inputValue}
                                onChange={(event) =>
                                    setInputValue(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleSend()
                                    }
                                }}
                            />
                            <div className={css.inputActions}>
                                <Icon name="add-plus" size="sm" />
                                {inputValue.trim() ? (
                                    <Button
                                        intent="primary"
                                        size="sm"
                                        aria-label="Send"
                                        leadingSlot={
                                            <Icon name="send" size="sm" />
                                        }
                                        onClick={handleSend}
                                    />
                                ) : (
                                    <Icon name="soundwave" size="sm" />
                                )}
                            </div>
                        </div>

                        <CategoryLauncher onStarterClick={setInputValue} />
                    </div>

                    <section className={css.opportunities}>
                        <div className={css.opportunitiesHeader}>
                            <div className={css.opportunitiesHeaderTitle}>
                                For you today
                            </div>
                            <div className={css.opportunitiesHeaderSubtitle}>
                                Gaia found a few gaps that require your
                                attention
                            </div>
                        </div>

                        <div className={css.opportunityGrid}>
                            {OPPORTUNITIES.map((opportunity, index) => (
                                <div
                                    key={index}
                                    className={css.opportunityCard}
                                >
                                    <div className={css.opportunityTags}>
                                        <Tag
                                            size="sm"
                                            leadingSlot={
                                                <span
                                                    className={css.criticalIcon}
                                                >
                                                    <Icon
                                                        name="arrow-chevron-up-duo"
                                                        size="xs"
                                                    />
                                                </span>
                                            }
                                        >
                                            Critical
                                        </Tag>
                                        <Tag size="sm">AI Agent</Tag>
                                    </div>
                                    <div className={css.opportunityTitle}>
                                        {opportunity.title}
                                    </div>
                                    <div className={css.opportunityFinding}>
                                        {opportunity.finding}
                                    </div>
                                    <div className={css.opportunityAutomation}>
                                        <Icon name="trending-up" size="xs" />
                                        {opportunity.automationDelta} increase
                                        on automation rate
                                    </div>
                                    <div className={css.opportunityActions}>
                                        <Button intent="primary" size="sm">
                                            Approve
                                        </Button>
                                        <Button intent="secondary" size="sm">
                                            Dismiss
                                        </Button>
                                        <Button
                                            intent="tertiary"
                                            size="sm"
                                            leadingSlot={
                                                <Icon
                                                    name="chat-circle"
                                                    size="sm"
                                                />
                                            }
                                        >
                                            Ask Gaia
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            as={Link}
                            to="/app/gaia-opportunities"
                            intent="tertiary"
                            size="sm"
                        >
                            View all opportunities
                        </Button>
                    </section>
                </div>
            </div>

            {isChatOpen && <GaiaChatOverlay onClose={handleCloseChat} />}
        </main>
    )
}
