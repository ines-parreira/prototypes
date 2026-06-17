import { useEffect, useState } from 'react'
import { Button, Icon, Tag } from '@gorgias/axiom'
import { useCopilot } from '@gorgias/copilot'

import { CategoryLauncher } from './CategoryLauncher'
import { GaiaChatOverlay } from './GaiaChatOverlay'
import { MetricsChartCard } from './MetricsChartCard'
import css from './GaiaHomePage.less'

const OPPORTUNITIES = [
    {
        title: 'Two skills give shoppers different return windows',
        action: 'Configure Loop order return action',
        body: '"Returns" says 30 days, "Holiday policy" says 14. It affected 218 conversations this contradiction last month.',
    },
    {
        title: '"Order tracking" resolves below your average',
        action: 'Improve existing skill',
        body: 'High volume (1,020 convos) but 41% success. Gaia suggests adding carrier-specific instructions.',
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
                        <div className={css.opportunityGrid}>
                            {OPPORTUNITIES.map((opportunity, index) => (
                                <div
                                    key={index}
                                    className={css.opportunityCard}
                                >
                                    <Tag size="sm">Label</Tag>
                                    <div className={css.opportunityTitle}>
                                        {opportunity.title}
                                    </div>
                                    <div className={css.opportunitySubtitle}>
                                        {opportunity.action}
                                    </div>
                                    <div className={css.opportunityImpact}>
                                        {opportunity.body}
                                    </div>
                                    <Button intent="secondary" size="sm">
                                        Review
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <button type="button" className={css.viewMore}>
                            View more opportunities
                        </button>
                    </section>
                </div>
            </div>

            {isChatOpen && <GaiaChatOverlay onClose={handleCloseChat} />}
        </main>
    )
}
