import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Icon,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
    settingsUrl: string
    isCampaign?: boolean
}

export const SmsSenderRequiredModal = ({
    isOpen,
    onClose,
    settingsUrl,
    isCampaign,
}: Props) => {
    const history = useHistory()
    const message = isCampaign ? 'send this campaign' : 'activate this flow'

    const handleGoToSettings = () => {
        onClose()
        history.push(settingsUrl)
    }

    return (
        <Modal
            size="sm"
            isOpen={isOpen}
            onOpenChange={(nextState) => {
                if (!nextState) onClose()
            }}
        >
            <OverlayHeader title="Add sender phone number" />
            <OverlayContent paddingBottom={'md'}>
                <Box gap="xs">
                    <Text>
                        {`Select a phone number in Settings to ${message}.`}
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button variant="tertiary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    trailingSlot={<Icon name="external-link" size="sm" />}
                    onClick={handleGoToSettings}
                >
                    Go to Settings
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
