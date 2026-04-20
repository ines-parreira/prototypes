import { useState } from 'react'

import { Link } from 'react-router-dom'

import {
    Banner,
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    TextAreaField,
} from '@gorgias/axiom'

import type { ConflictBannerType, SkillDisableInfo } from './useSkillConflicts'
import { useSkillPublishModal } from './useSkillPublishModal'

const COMMIT_MESSAGE_CHARACTER_LIMIT = 280

const PublishBanner = ({
    bannerType,
    skillsToDisableInfo,
}: {
    bannerType: ConflictBannerType
    skillsToDisableInfo: SkillDisableInfo[]
}) => {
    if (bannerType === 'none') return null

    if (bannerType === 'skills-disabled') {
        return (
            <Banner
                intent="info"
                variant="inline"
                size="md"
                icon="info"
                description={
                    <span style={{ whiteSpace: 'normal' }}>
                        Reassigning intents will disable the following skills,
                        because they no longer have any linked intents:{' '}
                        {skillsToDisableInfo.map((skill, index) => (
                            <span key={skill.id}>
                                {index > 0 && ', '}
                                <Link
                                    to={skill.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {skill.title}
                                </Link>
                            </span>
                        ))}
                    </span>
                }
                isClosable={false}
            />
        )
    }

    return (
        <Banner
            intent="info"
            variant="inline"
            size="md"
            icon="info"
            description={
                <span style={{ whiteSpace: 'normal' }}>
                    Updates to this skill&apos;s intents will affect how AI
                    Agent handles those conversations.
                </span>
            }
            isClosable={false}
        />
    )
}

export const SkillPublishModal = () => {
    const {
        isOpen,
        isPublishing,
        bannerType,
        skillsToDisableInfo,
        onClose,
        onPublish,
    } = useSkillPublishModal()
    const [commitMessage, setCommitMessage] = useState('')

    const handleCommitMessageChange = (value: string) => {
        setCommitMessage(value.slice(0, COMMIT_MESSAGE_CHARACTER_LIMIT))
    }

    const handlePublish = () => {
        onPublish(commitMessage.trim()).then(() => setCommitMessage(''))
    }

    const handleClose = () => {
        setCommitMessage('')
        onClose()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !isPublishing) {
            event.preventDefault()
            handlePublish()
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={handleClose} size="sm">
            <OverlayHeader title="Publish changes?" />
            <OverlayContent>
                <Box flexDirection="column" gap="md" width="100%">
                    <PublishBanner
                        bannerType={bannerType}
                        skillsToDisableInfo={skillsToDisableInfo}
                    />
                    <TextAreaField
                        label="Change summary"
                        placeholder="Updated return policy to reflect new 30 day window"
                        value={commitMessage}
                        onChange={handleCommitMessageChange}
                        onKeyDown={handleKeyDown}
                        caption={`This note will be visible to your team in version history. ${commitMessage.length}/${COMMIT_MESSAGE_CHARACTER_LIMIT}`}
                        autoFocus
                        rows={3}
                    />
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={handleClose}
                        isDisabled={isPublishing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePublish}
                        isLoading={isPublishing}
                    >
                        Publish
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
