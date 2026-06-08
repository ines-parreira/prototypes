import { useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    Box,
    Button,
    Icon,
    Modal,
    OverlayContent,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { copyToClipboard } from 'AIJourney/utils/copyToClipboard'

import css from './StarterPromptModal.module.less'

export const STARTER_PROMPT = `I need to create a tone of voice guideline for my brand's AI agent inside Gorgias. Here's what you need to know about the setup:

- Gorgias is a customer experience platform for e-commerce stores (Shopify, etc.)
- The AI agent texts my shoppers directly over SMS on behalf of my brand
- It handles multiple marketing flows: welcome messages, cart recovery, browse abandonment, win-back, and campaigns
- The tone of voice I'm writing is shared across ALL these flows — it's the consistent personality layer
- Flow-specific details (what to say in a cart abandonment vs. a welcome message) are handled separately in flows instructions — they do NOT belong in the tone of voice

The tone of voice must be under 2,000 characters. This is a hard limit. Shorter and sharper is better — the AI agent follows precise, instruction-like guidance much better than long, inspirational brand copy. Before drafting anything, you can ask me questions about:

- My brand, what we sell, who our audience is
- How I want the brand to sound in a text message (not email, not website — SMS specifically)
- Any words, phrases, or styles I want to avoid
- How formal or casual we are
- Whether we use emojis, slang, exclamation marks, etc.

Once you have enough context, draft the tone of voice with these sections:

1. Brand personality — 1-2 sentences max. Who is the brand if it were a person texting a shopper?
2. Voice attributes — 3-5 descriptive words, each with a one-line explanation of what it means in practice (e.g. "Confident — state recommendations directly, never hedge with 'maybe you'd like' or 'you might want to consider'")
3. Greeting & sign-off style — How should the first message open? Should it use the shopper's name? How casual?
4. CTA style — How should the AI nudge toward action? Direct ("Check it out here")? Soft ("Worth a look if you're curious")?
5. Do / Don't examples — 2-3 of each. Show a bad version and the corrected version side by side.
6. Words to avoid — Specific words or phrases that are off-brand.

Important: Write this as clear instructions an AI can follow, not as a brand manifesto. "We're bold and fearless" means nothing to an AI. "Use short punchy sentences. Never apologize. Lead with the offer, not the greeting." — that's what works.
Keep the total output under 2,000 characters, as plain text, with no rich formatting.`

type StarterPromptModalProps = {
    isOpen: boolean
    onClose: () => void
}

export const StarterPromptModal = ({
    isOpen,
    onClose,
}: StarterPromptModalProps) => {
    const [hasCopied, setHasCopied] = useState(false)

    useEffect(() => {
        if (!hasCopied) return
        const timeoutId = window.setTimeout(
            () => setHasCopied(false),
            Duration.millis(1500),
        )
        return () => window.clearTimeout(timeoutId)
    }, [hasCopied])

    const handleCopy = async () => {
        const succeeded = await copyToClipboard(STARTER_PROMPT)
        if (succeeded) setHasCopied(true)
    }

    return (
        <Modal
            size="lg"
            isOpen={isOpen}
            isDismissable
            onOpenChange={(nextState) => {
                if (!nextState) onClose()
            }}
        >
            <OverlayHeader title="Starter prompt" />
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    <Text color="var(--content-neutral-secondary)">
                        Paste this prompt into your AI tool of choice (ChatGPT,
                        Claude, etc.). It will ask you questions about your
                        brand, then generate a tone of voice guidance you can
                        paste into Gorgias.
                    </Text>
                    <div aria-label="Starter prompt" className={css.prompt}>
                        <p>
                            I need to create a tone of voice guideline for my
                            brand’s AI agent inside Gorgias. Here’s what you
                            need to know about the setup:
                        </p>
                        <ul>
                            <li>
                                Gorgias is a customer experience platform for
                                e-commerce stores (Shopify, etc.)
                            </li>
                            <li>
                                The AI agent texts my shoppers directly over SMS
                                on behalf of my brand
                            </li>
                            <li>
                                It handles multiple marketing flows: welcome
                                messages, cart recovery, browse abandonment,
                                win-back, and campaigns
                            </li>
                            <li>
                                The tone of voice I’m writing is shared across
                                ALL these flows — it’s the consistent
                                personality layer
                            </li>
                            <li>
                                Flow-specific details (what to say in a cart
                                abandonment vs. a welcome message) are handled
                                separately in flows instructions — they do NOT
                                belong in the tone of voice
                            </li>
                        </ul>
                        <p>
                            The tone of voice must be under 2,000 characters.
                            This is a hard limit. Shorter and sharper is better
                            — the AI agent follows precise, instruction-like
                            guidance much better than long, inspirational brand
                            copy. Before drafting anything, you can ask me
                            questions about:
                        </p>
                        <ul>
                            <li>My brand, what we sell, who our audience is</li>
                            <li>
                                How I want the brand to sound in a text message
                                (not email, not website — SMS specifically)
                            </li>
                            <li>
                                Any words, phrases, or styles I want to avoid
                            </li>
                            <li>How formal or casual we are</li>
                            <li>
                                Whether we use emojis, slang, exclamation marks,
                                etc.
                            </li>
                        </ul>
                        <p>
                            Once you have enough context, draft the tone of
                            voice with these sections:
                        </p>
                        <ol>
                            <li>
                                Brand personality — 1-2 sentences max. Who is
                                the brand if it were a person texting a shopper?
                            </li>
                            <li>
                                Voice attributes — 3-5 descriptive words, each
                                with a one-line explanation of what it means in
                                practice (e.g. “Confident — state
                                recommendations directly, never hedge with
                                ‘maybe you’d like’ or ‘you might want to
                                consider’”)
                            </li>
                            <li>
                                Greeting & sign-off style — How should the first
                                message open? Should it use the shopper’s name?
                                How casual?
                            </li>
                            <li>
                                CTA style — How should the AI nudge toward
                                action? Direct (“Check it out here”)? Soft
                                (“Worth a look if you’re curious”)?
                            </li>
                            <li>
                                Do / Don’t examples — 2-3 of each. Show a bad
                                version and the corrected version side by side.
                            </li>
                            <li>
                                Words to avoid — Specific words or phrases that
                                are off-brand.
                            </li>
                        </ol>
                        <p>
                            Important: Write this as clear instructions an AI
                            can follow, not as a brand manifesto. “We’re bold
                            and fearless” means nothing to an AI. “Use short
                            punchy sentences. Never apologize. Lead with the
                            offer, not the greeting.” — that’s what works.
                        </p>
                        <p>
                            Keep the total output under 2,000 characters, as
                            plain text, with no rich formatting.
                        </p>
                    </div>
                    <Box justifyContent="flex-end">
                        <Button
                            variant="secondary"
                            onClick={handleCopy}
                            leadingSlot={
                                hasCopied ? (
                                    <Icon name="check" size="sm" />
                                ) : undefined
                            }
                        >
                            {hasCopied ? 'Copied' : 'Copy'}
                        </Button>
                    </Box>
                </Box>
            </OverlayContent>
        </Modal>
    )
}
