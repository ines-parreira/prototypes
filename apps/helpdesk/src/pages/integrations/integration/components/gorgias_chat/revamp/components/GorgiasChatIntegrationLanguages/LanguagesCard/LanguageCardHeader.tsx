import {
    Box,
    Icon,
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
            <Icon name="arrow-down" size={IconSize.Xs} />
        </Box>
    )
}
