import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Menu,
    MenuItem,
    Text,
} from '@gorgias/axiom'
import { useCopilot, useCopilotPanel } from '@gorgias/copilot'

import { gaiaComposerOrbUrl } from './gaiaComposerOrb'
import { getFolder, GROUP_ORDER } from './gaiaFolders'
import css from './GaiaFolderPage.less'

/**
 * One reusable folder page driven by the `:folderId` route param — the folder
 * name, description, chats, sources and members all come from that folder's
 * data. Used for every existing folder, no per-folder hardcoding.
 */
export function GaiaFolderPage() {
    const { folderId } = useParams<{ folderId: string }>()
    const folder = getFolder(folderId)

    const { sendPrompt } = useCopilot()
    const { setIsOpen: setPanelOpen } = useCopilotPanel()

    const [tab, setTab] = useState<'chats' | 'sources'>('chats')
    const [draft, setDraft] = useState('')
    const [description, setDescription] = useState(folder?.description ?? '')
    const [editingDescription, setEditingDescription] = useState(false)

    // Reset per-folder state when navigating between folders (the component
    // instance is reused across folder routes).
    useEffect(() => {
        setDescription(folder?.description ?? '')
        setEditingDescription(false)
        setTab('chats')
        setDraft('')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderId])

    if (!folder) {
        return (
            <div className={css.page}>
                <div className={css.surface}>
                    <div className={css.emptyState}>Folder not found.</div>
                </div>
            </div>
        )
    }

    const memberLabel =
        folder.members.length === 0
            ? 'Just you'
            : `${folder.members.length} member${
                  folder.members.length > 1 ? 's' : ''
              }`

    const startChat = () => {
        const message = draft.trim()
        if (!message) return
        sendPrompt(message)
        setPanelOpen(true)
        setDraft('')
    }

    const sections = GROUP_ORDER.map((group) => ({
        group,
        chats: folder.chats.filter((chat) => chat.group === group),
    })).filter((section) => section.chats.length > 0)

    return (
        <div className={css.page}>
            <div className={css.surface}>
                <div className={css.header}>
                    <span className={css.title}>{folder.name}</span>
                    <div className={css.headerActions}>
                        <Button
                            variant="primary"
                            leadingSlot={<Icon name="note-edit" size="sm" />}
                            onClick={() => {
                                sendPrompt(`New chat in ${folder.name}`)
                                setPanelOpen(true)
                            }}
                        >
                            New chat in folder
                        </Button>
                        <Menu
                            aria-label="Folder actions"
                            placement="bottom right"
                            trigger={
                                <Button
                                    variant="secondary"
                                    icon="dots-kebab-vertical"
                                    aria-label="Folder actions"
                                    className={css.kebabButton}
                                />
                            }
                        >
                            <MenuItem
                                id="edit"
                                leadingSlot="edit-pencil"
                                label="Edit"
                                onAction={() => setEditingDescription(true)}
                            />
                            <MenuItem
                                id="delete"
                                leadingSlot="trash-empty"
                                label="Delete"
                                intent="destructive"
                            />
                        </Menu>
                    </div>
                </div>

                <div className={css.scroll}>
                    <div className={css.body}>
                        {/* Description — editable placeholder when empty. */}
                        {editingDescription ? (
                            <input
                                className={css.descInput}
                                autoFocus
                                value={description}
                                placeholder="Add a description for this folder"
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                onBlur={() => setEditingDescription(false)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter')
                                        setEditingDescription(false)
                                }}
                            />
                        ) : description ? (
                            <button
                                type="button"
                                className={css.description}
                                onClick={() => setEditingDescription(true)}
                            >
                                {description}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={css.descriptionPlaceholder}
                                onClick={() => setEditingDescription(true)}
                            >
                                Add a description for this folder
                            </button>
                        )}

                        {/* Summary metadata. */}
                        <div className={css.meta}>
                            <span className={css.metaItem}>
                                <Icon name="chat-circle" size="sm" />
                                {folder.chats.length} chats
                            </span>
                            <span className={css.metaItem}>
                                <Icon name="file-document" size="sm" />
                                {folder.sources.length} files
                            </span>
                            <span className={css.metaItem}>
                                <Icon name="user" size="sm" />
                                {memberLabel}
                            </span>
                        </div>

                        {/* New chat composer scoped to this folder. */}
                        <div className={css.composer}>
                            <img
                                className={css.composerOrb}
                                src={gaiaComposerOrbUrl}
                                alt=""
                            />
                            <input
                                className={css.composerInput}
                                placeholder={`New chat in ‘${folder.name.toLowerCase()}’ folder`}
                                value={draft}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        startChat()
                                    }
                                }}
                            />
                            <div className={css.composerActions}>
                                {draft.trim() ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon="send"
                                        aria-label="Send"
                                        onClick={startChat}
                                    />
                                ) : (
                                    <>
                                        <Icon name="add-plus" size="sm" />
                                        <Icon name="soundwave" size="sm" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={css.tabsBar}>
                            <ButtonGroup
                                selectedKey={tab}
                                onSelectionChange={(key) =>
                                    setTab(key as 'chats' | 'sources')
                                }
                            >
                                <ButtonGroupItem id="chats">
                                    Chats
                                </ButtonGroupItem>
                                <ButtonGroupItem id="sources">
                                    Sources
                                </ButtonGroupItem>
                            </ButtonGroup>
                        </div>

                        {tab === 'chats' ? (
                            <div className={css.list}>
                                {sections.map((section) => (
                                    <div
                                        key={section.group}
                                        className={css.group}
                                    >
                                        <div className={css.groupHeader}>
                                            {section.group}
                                        </div>
                                        {section.chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className={css.row}
                                            >
                                                <div className={css.rowMain}>
                                                    <Text
                                                        variant="medium"
                                                        overflow="ellipsis"
                                                    >
                                                        {chat.title}
                                                    </Text>
                                                    <Text
                                                        overflow="ellipsis"
                                                        className={
                                                            css.rowSummary
                                                        }
                                                    >
                                                        {chat.summary}
                                                    </Text>
                                                </div>
                                                <span className={css.rowTime}>
                                                    {chat.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : folder.sources.length > 0 ? (
                            <div className={css.list}>
                                {folder.sources.map((source) => (
                                    <div key={source.id} className={css.row}>
                                        <div className={css.rowMain}>
                                            <span className={css.sourceRow}>
                                                <Icon
                                                    name="file-document"
                                                    size="sm"
                                                />
                                                {source.name}
                                            </span>
                                        </div>
                                        <span className={css.rowTime}>
                                            {source.kind}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={css.emptyState}>
                                No sources yet — add files as folder knowledge.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
