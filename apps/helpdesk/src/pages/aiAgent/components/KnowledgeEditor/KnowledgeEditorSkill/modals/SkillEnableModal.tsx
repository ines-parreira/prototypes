import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { ConflictBannerType, SkillDisableInfo } from './useSkillConflicts'
import { useSkillEnableModal } from './useSkillEnableModal'

const EnableConflictMessage = ({
    bannerType,
    skillsToDisableInfo,
    isFirstTimeEnable,
}: {
    bannerType: ConflictBannerType
    skillsToDisableInfo: SkillDisableInfo[]
    isFirstTimeEnable: boolean
}) => {
    if (bannerType === 'skills-disabled') {
        return (
            <Text size="md">
                Reassigning intents will disable the following skills, because
                they no longer have any linked intents:{' '}
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
            </Text>
        )
    }

    if (isFirstTimeEnable) {
        return (
            <Text size="md">
                This skill contains intents used in other skills. Enabling this
                skill will affect how an agent handles those conversations.
            </Text>
        )
    }

    return (
        <Text size="md">
            Updates to this skill&apos;s intents will affect how AI Agent
            handles those conversations.
        </Text>
    )
}

export const SkillEnableModal = () => {
    const {
        isOpen,
        isEnabling,
        bannerType,
        skillsToDisableInfo,
        isFirstTimeEnable,
        onClose,
        onEnable,
    } = useSkillEnableModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Enable skill?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <EnableConflictMessage
                        bannerType={bannerType}
                        skillsToDisableInfo={skillsToDisableInfo}
                        isFirstTimeEnable={isFirstTimeEnable}
                    />
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isEnabling}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onEnable}
                        isLoading={isEnabling}
                    >
                        Enable
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
