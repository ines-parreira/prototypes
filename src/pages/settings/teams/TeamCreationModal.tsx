import React, {FormEvent, useCallback, useMemo, useRef, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {AnyAction} from 'redux'
import {EmojiData, BaseEmoji, emojiIndex} from 'emoji-mart'
import {fromJS} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import InputField from 'pages/common/forms/input/InputField'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import Label from 'pages/common/forms/Label/Label'
import history from 'pages/history'
import {createTeam} from 'state/teams/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import css from './TeamCreationModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function TeamCreationModal({isOpen, onClose}: Props) {
    const dispatch = useAppDispatch()
    const ref = useRef<HTMLDivElement>(null)
    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [emoji, setEmoji] = useState<EmojiData>()

    const isValidForm = useMemo(() => !!name, [name])

    const [{loading: isSubmitting}, submitTeam] = useAsyncFn(
        async (event: FormEvent) => {
            event.preventDefault()
            const res = (await dispatch(
                createTeam(
                    fromJS({
                        name,
                        description,
                        decoration: {
                            ...(!!emoji ? {emoji} : {}),
                        },
                        members: [],
                    })
                )
            )) as AnyAction

            if (!res.error) {
                logEvent(SegmentEvent.TeamCreation, {'referrer-page': 'teams'})
                onClose()
                setName('')
                setEmoji(undefined)
                setDescription('')
                history.push(
                    `/app/settings/teams/${
                        (res as unknown as Map<any, any>).get('id') as number
                    }/members`
                )
            }
        },
        [description, emoji, name]
    )

    const handleSubmit = useCallback(
        async (event: FormEvent) => {
            if (isValidForm) {
                await submitTeam(event)
            }
        },
        [isValidForm, submitTeam]
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div ref={ref}>
                <form onSubmit={handleSubmit}>
                    <ModalHeader title="Create team" />
                    <ModalBody>
                        <Label className={css.label} isRequired htmlFor="name">
                            Team name
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <EmojiSelect
                                className={css.emojiSelect}
                                emoji={(emoji as BaseEmoji)?.native}
                                onEmojiSelect={(emoji) => {
                                    setEmoji(
                                        Object.values(emojiIndex.emojis).find(
                                            (value) =>
                                                (value as BaseEmoji)?.native ===
                                                emoji
                                        ) as EmojiData | undefined
                                    )
                                }}
                                onEmojiClear={() => setEmoji(undefined)}
                                container={ref}
                            />
                            <TextInput
                                id="name"
                                value={name || ''}
                                placeholder="Team name"
                                onChange={setName}
                                autoFocus
                                isRequired
                            />
                        </InputGroup>
                        <InputField
                            id="description"
                            label="Description"
                            className={css.inputGroup}
                            value={description || ''}
                            placeholder="Works on making things awesome!"
                            onChange={setDescription}
                        />
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button intent="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isDisabled={!isValidForm}
                            isLoading={isSubmitting}
                        >
                            Create team
                        </Button>
                    </ModalActionsFooter>
                </form>
            </div>
        </Modal>
    )
}
