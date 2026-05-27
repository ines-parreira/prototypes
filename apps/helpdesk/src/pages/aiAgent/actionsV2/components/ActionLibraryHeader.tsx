import { Box, Button } from '@gorgias/axiom'

import { useDisplayPlaygroundButtonInLayoutHeader } from 'pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'

import { ACTION_LIBRARY_LEARNING_RESOURCES_URL } from '../constants'

type Props = {
    shopName: string
    shopType: 'shopify'
    onCreate: () => void
}

const ActionLibraryHeader = ({ shopName, shopType, onCreate }: Props) => {
    const { togglePlayground, isPlaygroundOpen } = usePlaygroundPanel()
    const showTestButton = useDisplayPlaygroundButtonInLayoutHeader({
        shopName,
        shopType,
    })

    return (
        <Box flexDirection="row" alignItems="center" gap="md">
            <Button
                variant="tertiary"
                size="md"
                as="a"
                href={ACTION_LIBRARY_LEARNING_RESOURCES_URL}
                target="_blank"
                rel="noreferrer noopener"
                trailingSlot="external-link"
            >
                Learning resources
            </Button>
            {showTestButton && !isPlaygroundOpen && (
                <Button
                    variant="secondary"
                    size="md"
                    onClick={togglePlayground}
                    as="button"
                >
                    Test
                </Button>
            )}
            <Button variant="primary" size="md" onClick={onCreate} as="button">
                Create action
            </Button>
        </Box>
    )
}

export default ActionLibraryHeader
