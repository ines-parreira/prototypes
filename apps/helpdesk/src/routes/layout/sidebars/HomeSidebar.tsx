import { useState } from 'react'

import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { useLocation } from 'react-router-dom'

import {
    Box,
    Button,
    Quantity,
    Tag,
    Text,
    toast,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useCopilot, useCopilotPanel } from '@gorgias/copilot'

import { CreateFolderModal } from 'pages/aiAgent/gaiaHome/CreateFolderModal'
import type { ProductMetadata } from 'routes/layout/productMetadata'
import { Product, productMetadata } from 'routes/layout/productMetadata'
import { CollapsedHomeSidebar } from 'routes/layout/sidebars/CollapsedHomeSidebar'
import { useNavigationProducts } from 'routes/layout/useNavigationProducts'

type ProductNavigationSectionProps = {
    product: ProductMetadata
    requiresUpgrade?: boolean
}

function ProductNavigationSection({
    product,
    requiresUpgrade,
}: ProductNavigationSectionProps) {
    return (
        <NavigationSection
            id={product.id}
            to={product.defaultPath}
            exact
            label={
                requiresUpgrade ? (
                    <Box alignItems="center" gap="xxs">
                        <div>{product.name}</div>
                        <Tag color="green" size="sm">
                            Upgrade
                        </Tag>
                    </Box>
                ) : (
                    product.name
                )
            }
            leadingSlot={product.icon}
        />
    )
}

const CHATS_PATH = '/app/gaia-conversations'

// These sidebar entries all point at the Chats page, so route-matching would
// mark them all "active" at once. Opt them out — nothing is selected until the
// user actually clicks in.
const NEVER_ACTIVE = () => false

// Category headers (Pinned / Folders / Recents): regular, small, secondary.
function SectionLabel({ children }: { children: string }) {
    return (
        <Text size="sm" variant="regular" color="content-neutral-secondary">
            {children}
        </Text>
    )
}

const PINNED_CHATS = [{ id: 'improve-setup', label: 'Improve my setup' }]

const CHAT_FOLDERS = [
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'reporting', label: 'Reporting' },
]

// Five most recent chats surfaced under Recents.
const RECENT_CHATS = [
    { id: 'r1', label: 'Automation rate drop' },
    { id: 'r2', label: 'Refund policy gaps' },
    { id: 'r3', label: 'Top intents this month' },
    { id: 'r4', label: 'Shipping-delay macro' },
    { id: 'r5', label: 'CSAT trend after May' },
]

/**
 * Hover action on the Chats section: opens the existing Gaia side panel in a
 * fresh thread. Reuses `useCopilotPanel` — no new panel implementation.
 */
function NewChatAction() {
    const { setIsOpen } = useCopilotPanel()
    const { newThread } = useCopilot()

    return (
        <Tooltip
            placement="top"
            trigger={
                <Button
                    variant="tertiary"
                    size="sm"
                    icon="note-edit"
                    aria-label="New chat"
                    onClick={(event) => {
                        // Don't toggle the Chats disclosure when clicking.
                        event.stopPropagation()
                        newThread()
                        setIsOpen(true)
                    }}
                />
            }
        >
            <TooltipContent title="New chat" />
        </Tooltip>
    )
}

/** Hover action on the Folders section: opens the New folder modal. */
function NewFolderAction() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Tooltip
                placement="top"
                trigger={
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="folder-add"
                        aria-label="New folder"
                        onClick={(event) => {
                            // Don't toggle the Folders disclosure when clicking.
                            event.stopPropagation()
                            setIsOpen(true)
                        }}
                    />
                }
            >
                <TooltipContent title="New folder" />
            </Tooltip>

            {isOpen && (
                <CreateFolderModal
                    onClose={() => setIsOpen(false)}
                    onCreate={(folder) =>
                        toast.success(`Folder “${folder.name}” created`)
                    }
                />
            )}
        </>
    )
}

/**
 * Prototype-only sidebar for the Gaia pages (`/app/gaia-*`). Kept separate
 * from the real Home product navigation so `/app/home` is unaffected. Uses the
 * standard NavigationSection so only the active route is highlighted.
 */
function GaiaHomePrototypeSidebar() {
    return (
        <Box flexDirection="column" height="100%" gap="sm">
            <NavigationSectionGroup
                storageKey="gaia-home"
                defaultExpandedKeys={['gaia-chats']}
            >
                <NavigationSectionItem
                    id="gaia-digest"
                    to="/app/gaia-home"
                    exact
                    label="Daily digest"
                    leadingSlot="menu-alt-2"
                />
                <NavigationSectionItem
                    id="gaia-opportunities"
                    to="/app/gaia-opportunities"
                    exact
                    leadingSlot="light-bulb"
                    label="Spotlight"
                    trailingSlot={({ isActive }) => (
                        <Quantity
                            quantity={9}
                            color={isActive ? 'purple' : undefined}
                        />
                    )}
                />
                <NavigationSectionItem
                    id="gaia-scheduled-runs"
                    to="/app/gaia-scheduled-runs"
                    exact
                    label="Scheduled runs"
                    leadingSlot="calendar"
                />
                <NavigationSection
                    id="gaia-chats"
                    label="Chats"
                    leadingSlot="chat-circle"
                    actionsSlot={<NewChatAction />}
                >
                    <NavigationSection
                        id="gaia-chats-pinned"
                        label={<SectionLabel>Pinned</SectionLabel>}
                        defaultExpanded
                    >
                        {PINNED_CHATS.map((chat) => (
                            <NavigationSectionItem
                                key={chat.id}
                                id={`gaia-pinned-${chat.id}`}
                                to={CHATS_PATH}
                                label={chat.label}
                                isActive={NEVER_ACTIVE}
                            />
                        ))}
                    </NavigationSection>

                    <NavigationSection
                        id="gaia-chats-folders"
                        label={<SectionLabel>Folders</SectionLabel>}
                        actionsSlot={<NewFolderAction />}
                        defaultExpanded
                    >
                        {CHAT_FOLDERS.map((folder) => (
                            <NavigationSectionItem
                                key={folder.id}
                                id={`gaia-folder-${folder.id}`}
                                to={`/app/gaia-folder/${folder.id}`}
                                label={folder.label}
                                leadingSlot="folder"
                            />
                        ))}
                    </NavigationSection>

                    <NavigationSection
                        id="gaia-chats-recents"
                        label={<SectionLabel>Recents</SectionLabel>}
                        defaultExpanded
                    >
                        {RECENT_CHATS.map((chat) => (
                            <NavigationSectionItem
                                key={chat.id}
                                id={`gaia-recent-${chat.id}`}
                                to={CHATS_PATH}
                                label={chat.label}
                                isActive={NEVER_ACTIVE}
                            />
                        ))}
                        <NavigationSectionItem
                            id="gaia-chats-more"
                            to={CHATS_PATH}
                            label="More"
                            leadingSlot="dots-meatballs-horizontal"
                            isActive={NEVER_ACTIVE}
                        />
                    </NavigationSection>
                </NavigationSection>
            </NavigationSectionGroup>
        </Box>
    )
}

export function HomeSidebar() {
    const { isCollapsed } = useSidebar()
    const { pathname } = useLocation()
    const {
        canAccessAiAgent,
        aiAgentRequiresUpgrade,
        isAiJourneyVisible,
        isConvertVisible,
    } = useNavigationProducts()

    if (isCollapsed) {
        return <CollapsedHomeSidebar />
    }

    if (pathname.includes('/gaia-')) {
        return <GaiaHomePrototypeSidebar />
    }

    return (
        <NavigationSectionGroup storageKey="home" defaultExpandedKeys={[]}>
            <ProductNavigationSection
                product={productMetadata[Product.Inbox]}
            />
            {canAccessAiAgent && (
                <ProductNavigationSection
                    product={productMetadata[Product.AiAgent]}
                    requiresUpgrade={aiAgentRequiresUpgrade}
                />
            )}
            {isAiJourneyVisible && (
                <ProductNavigationSection
                    product={productMetadata[Product.Marketing]}
                />
            )}
            {isConvertVisible && (
                <ProductNavigationSection
                    product={productMetadata[Product.Convert]}
                />
            )}
            <ProductNavigationSection
                product={productMetadata[Product.Analytics]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Workflows]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Customers]}
            />
            <ProductNavigationSection
                product={productMetadata[Product.Settings]}
            />
        </NavigationSectionGroup>
    )
}
