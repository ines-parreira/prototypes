import { Box, Button, Text } from '@gorgias/axiom'

import { ProviderIcon } from '../../shared/ProviderIcon'

import css from './StepRow.less'

type Props = {
    index: number
    providerName: string
    providerIconUrl?: string
    actionName: string
    validationError?: string
    onDelete: () => void
}

export const StepRow = ({
    index,
    providerName,
    providerIconUrl,
    actionName,
    validationError,
    onDelete,
}: Props) => {
    return (
        <Box flexDirection="column" gap="xxs" width="100%">
            <Box flexDirection="row" alignItems="center" gap="sm" width="100%">
                <div className={css.appCell}>
                    <div className={css.field}>
                        {providerIconUrl && (
                            <div className={css.fieldLeading}>
                                <ProviderIcon
                                    iconUrl={providerIconUrl}
                                    alt={providerName}
                                    size="sm"
                                    variant="plain"
                                />
                            </div>
                        )}
                        <div className={css.fieldText}>
                            <Text size="sm" color="content-neutral-default">
                                {providerName}
                            </Text>
                        </div>
                    </div>
                </div>
                <div className={css.actionCell}>
                    <div className={css.field}>
                        <div className={css.fieldText}>
                            <Text size="sm" color="content-neutral-default">
                                {actionName}
                            </Text>
                        </div>
                    </div>
                </div>
                <Button
                    as="button"
                    variant="tertiary"
                    size="sm"
                    intent="destructive"
                    icon="close"
                    onClick={onDelete}
                    aria-label={`Delete step ${index + 1}`}
                />
            </Box>
            {validationError && (
                <Text size="sm" color="content-error-default">
                    {validationError}
                </Text>
            )}
        </Box>
    )
}
