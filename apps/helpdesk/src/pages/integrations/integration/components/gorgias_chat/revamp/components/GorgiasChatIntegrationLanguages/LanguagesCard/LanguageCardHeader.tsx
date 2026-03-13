import {
    Box,
    Icon,
    IconName,
    IconSize,
    Text,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'

import css from './LanguagesCard.less'

export const LanguageCardHeader = () => {
    return (
        <Box
            flexDirection="row"
            alignItems="center"
            gap="xxs"
            className={css.cardHeader}
        >
            <Text size={TextSize.Sm} variant={TextVariant.Medium}>
                Language
            </Text>
            <Icon name={IconName.ArrowDown} size={IconSize.Xs} />
        </Box>
    )
}
