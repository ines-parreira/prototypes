import { useRef, useState } from 'react'
import {
    Avatar,
    Button,
    CheckBoxField,
    Icon,
    Modal,
    SearchField,
    Text,
} from '@gorgias/axiom'
import { TextAreaField, TextField } from '@gorgias/axiom'

import css from './GaiaHomePage.less'

export type FolderDraft = {
    name: string
    description: string
    // File names added as folder knowledge.
    knowledge: string[]
    people: string[]
}

const SUGGESTED_PEOPLE = [
    { id: 'cody', name: 'Cody Fisher' },
    { id: 'jane', name: 'Jane Cooper' },
    { id: 'jerome', name: 'Jerome Bell' },
    { id: 'leslie', name: 'Leslie Alexander' },
]

/**
 * "New folder" flow for Gaia chats — opened from a chat's "Move to a folder →
 * Create new folder" and from the sidebar Folders "+" action. Mirrors the
 * New workflow / New scheduled run modals. Name + Description are required;
 * folder knowledge and invited people are optional sub-views whose selections
 * survive returning to the main view.
 */
export function CreateFolderModal({
    onClose,
    onCreate,
}: {
    onClose: () => void
    onCreate: (folder: FolderDraft) => void
}) {
    const [view, setView] = useState<'main' | 'knowledge' | 'invite'>('main')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [knowledge, setKnowledge] = useState<string[]>([])
    const [people, setPeople] = useState<string[]>([])
    const [showErrors, setShowErrors] = useState(false)
    const [peopleSearch, setPeopleSearch] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const nameValid = name.trim().length > 0
    const descriptionValid = description.trim().length > 0
    const canCreate = nameValid && descriptionValid

    const toggle = (id: string, list: string[], set: (v: string[]) => void) =>
        set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

    const addFiles = (files: FileList | null) => {
        if (!files) return
        const names = Array.from(files).map((file) => file.name)
        setKnowledge((list) => [
            ...list,
            ...names.filter((name) => !list.includes(name)),
        ])
    }

    const removeFile = (fileName: string) =>
        setKnowledge((list) => list.filter((name) => name !== fileName))

    const handleCreate = () => {
        if (!canCreate) {
            setShowErrors(true)
            return
        }
        onCreate({
            name: name.trim(),
            description: description.trim(),
            knowledge,
            people,
        })
        onClose()
    }

    // ---- Add knowledge sub-view (file upload / drag-drop) -------------------
    if (view === 'knowledge') {
        return (
            <Modal isOpen onOpenChange={(open) => !open && onClose()} size="sm">
                <div className={css.dialog}>
                    <div className={css.dialogHeader}>
                        <div className={css.folderSubviewTitle}>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon="arrow-left"
                                aria-label="Back"
                                onClick={() => setView('main')}
                            />
                            <div className={css.dialogTitle}>Add knowledge</div>
                        </div>
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <button
                        type="button"
                        className={css.dropzone}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault()
                            addFiles(event.dataTransfer.files)
                        }}
                    >
                        <span className={css.dropzoneIcon}>
                            <Icon name="cloud-upload" size="md" />
                        </span>
                        <div className={css.dropzoneTitle}>
                            Drag &amp; drop files here
                        </div>
                        <Text color="content-neutral-secondary" size="sm">
                            or click to browse — PDF, DOCX, TXT, CSV
                        </Text>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            accept=".pdf,.doc,.docx,.txt,.csv,.md"
                            onChange={(event) => {
                                addFiles(event.target.files)
                                event.target.value = ''
                            }}
                        />
                    </button>

                    {knowledge.length > 0 && (
                        <div className={css.selectList}>
                            {knowledge.map((fileName) => (
                                <div key={fileName} className={css.fileRow}>
                                    <span className={css.selectRowMain}>
                                        <Icon name="file-document" size="sm" />
                                        <span className={css.selectRowLabel}>
                                            {fileName}
                                        </span>
                                    </span>
                                    <Button
                                        variant="tertiary"
                                        size="sm"
                                        icon="close"
                                        aria-label={`Remove ${fileName}`}
                                        onClick={() => removeFile(fileName)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={css.dialogFooter}>
                        <span className={css.selectCount}>
                            {knowledge.length} file
                            {knowledge.length === 1 ? '' : 's'}
                        </span>
                        <Button
                            variant="tertiary"
                            onClick={() => setView('main')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setView('main')}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    // ---- Invite people sub-view ---------------------------------------------
    if (view === 'invite') {
        const query = peopleSearch.trim().toLowerCase()
        const results = SUGGESTED_PEOPLE.filter(
            (person) => !query || person.name.toLowerCase().includes(query),
        )
        return (
            <Modal isOpen onOpenChange={(open) => !open && onClose()} size="sm">
                <div className={css.dialog}>
                    <div className={css.dialogHeader}>
                        <div className={css.folderSubviewTitle}>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon="arrow-left"
                                aria-label="Back"
                                onClick={() => setView('main')}
                            />
                            <div className={css.dialogTitle}>Invite people</div>
                        </div>
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <SearchField
                        aria-label="Search people"
                        placeholder="Search people by name or email..."
                        value={peopleSearch}
                        onChange={setPeopleSearch}
                    />

                    <div className={css.selectList}>
                        <span className={css.selectGroupLabel}>Suggested</span>
                        {results.map((person) => (
                            <div key={person.id} className={css.selectRow}>
                                <span className={css.selectRowMain}>
                                    <Avatar name={person.name} size="md" />
                                    <span className={css.selectRowLabel}>
                                        {person.name}
                                    </span>
                                </span>
                                <CheckBoxField
                                    aria-label={person.name}
                                    value={people.includes(person.id)}
                                    onChange={() =>
                                        toggle(person.id, people, setPeople)
                                    }
                                />
                            </div>
                        ))}
                        {results.length === 0 && (
                            <div className={css.selectEmpty}>No matches</div>
                        )}
                    </div>

                    <div className={css.dialogFooter}>
                        <span className={css.selectCount}>
                            {people.length} selected
                        </span>
                        <Button
                            variant="tertiary"
                            onClick={() => setView('main')}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setView('main')}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    // ---- Main view ----------------------------------------------------------
    return (
        <Modal isOpen onOpenChange={(open) => !open && onClose()} size="sm">
            <div className={css.dialog}>
                <div className={css.dialogHeader}>
                    <div>
                        <div className={css.dialogTitle}>New folder</div>
                        <Text className={css.dialogSubtitle}>
                            Folders keep chats, files, and custom instructions
                            in one single place. Use them for ongoing work, or
                            just to keep things tidy.
                        </Text>
                    </div>
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="close"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>

                <div className={css.dialogBody}>
                    <div className={css.field}>
                        <span className={css.fieldLabel}>
                            Name<span className={css.fieldRequired}>*</span>
                        </span>
                        <TextField
                            aria-label="Name"
                            value={name}
                            onChange={setName}
                            isInvalid={showErrors && !nameValid}
                        />
                        {showErrors && !nameValid && (
                            <span className={css.fieldError}>
                                Give the folder a name.
                            </span>
                        )}
                    </div>

                    <div className={css.field}>
                        <span className={css.fieldLabel}>
                            Description
                            <span className={css.fieldRequired}>*</span>
                        </span>
                        <TextAreaField
                            aria-label="Description"
                            rows={2}
                            placeholder="What’s this project for?"
                            value={description}
                            onChange={setDescription}
                            isInvalid={showErrors && !descriptionValid}
                        />
                        {showErrors && !descriptionValid && (
                            <span className={css.fieldError}>
                                Add a short description.
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={css.folderRow}
                        onClick={() => setView('knowledge')}
                    >
                        <span className={css.folderRowMain}>
                            <span className={css.folderRowIcon}>
                                <Icon name="folder-document" size="sm" />
                            </span>
                            {knowledge.length > 0
                                ? `${knowledge.length} file${
                                      knowledge.length > 1 ? 's' : ''
                                  } added`
                                : 'Add knowledge'}
                        </span>
                        <Icon name="arrow-chevron-right" size="sm" />
                    </button>

                    <button
                        type="button"
                        className={css.folderRow}
                        onClick={() => setView('invite')}
                    >
                        <span className={css.folderRowMain}>
                            <span className={css.folderRowIcon}>
                                <Icon name="users" size="sm" />
                            </span>
                            {people.length > 0
                                ? `${people.length} ${
                                      people.length > 1 ? 'people' : 'person'
                                  } invited`
                                : 'Invite people'}
                        </span>
                        <Icon name="arrow-chevron-right" size="sm" />
                    </button>
                </div>

                <div className={css.dialogFooter}>
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        isDisabled={!canCreate}
                        onClick={handleCreate}
                    >
                        Create folder
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
