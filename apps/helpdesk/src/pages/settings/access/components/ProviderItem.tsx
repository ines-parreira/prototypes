import { Box, Button } from '@gorgias/axiom'

import css from '../CustomProviderSso.less'

type ProviderItemProps = {
    disabled?: boolean
    onDelete: (providerId: string) => void
    onEdit: (providerId: string) => void
    providerId: string
    providerName: string
}

const ProviderItem = ({
    disabled = false,
    onDelete,
    onEdit,
    providerId,
    providerName,
}: ProviderItemProps) => {
    return (
        <Box key={providerId} padding={css.providerItemPadding}>
            <Box alignItems="center" justifyContent="between">
                <Box alignItems="center">
                    <span className={css.lockIcon}>🔒</span>
                    <span className={css.providerName}>{providerName} SSO</span>
                </Box>
                <Box>
                    <Button
                        fillStyle="ghost"
                        isDisabled={disabled}
                        onClick={() => onEdit(providerId)}
                        size="small"
                        intent="secondary"
                    >
                        Edit
                    </Button>
                    <Button
                        fillStyle="ghost"
                        isDisabled={disabled}
                        onClick={() => onDelete(providerId)}
                        size="small"
                        intent="destructive"
                    >
                        Remove
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default ProviderItem
