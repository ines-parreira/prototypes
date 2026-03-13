import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    IconName,
    Menu,
    MenuItem,
    MenuSection,
    Tag,
    TagColor,
    TagSize,
    Text,
    TextSize,
} from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import type { LanguageItemRow } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/types'

import css from './LanguagesCard.less'

type Props = {
    language: LanguageItemRow
    isUpdatePending: boolean
    onClickSetDefault: (language: LanguageItem) => void
    onOpenDeleteModal: (language: LanguageItemRow) => void
}

export const LanguageRow = ({
    language,
    isUpdatePending,
    onClickSetDefault,
    onOpenDeleteModal,
}: Props) => {
    const history = useHistory()

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            className={css.languageRow}
        >
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                className={css.languageName}
            >
                <Text size={TextSize.Md}>{language.label}</Text>
                {language.primary && (
                    <Tag color={TagColor.Purple} size={TagSize.Sm}>
                        Default
                    </Tag>
                )}
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Button
                    as={ButtonAs.Button}
                    size={ButtonSize.Sm}
                    variant={ButtonVariant.Secondary}
                    intent={ButtonIntent.Regular}
                    isDisabled={isUpdatePending}
                    onClick={() => history.push(language.link)}
                >
                    Customize
                </Button>
                {language.showActions && (
                    <Menu
                        trigger={
                            <Button
                                as={ButtonAs.Button}
                                size={ButtonSize.Sm}
                                variant={ButtonVariant.Tertiary}
                                intent={ButtonIntent.Regular}
                                icon={IconName.DotsMeatballsHorizontal}
                                aria-label="More actions"
                                isDisabled={language.primary || isUpdatePending}
                            />
                        }
                    >
                        <MenuSection id="language-actions">
                            <MenuItem
                                id="set-default"
                                label="Make default language"
                                onAction={() => onClickSetDefault(language)}
                            />
                            <MenuItem
                                id="delete"
                                label="Delete"
                                intent={ButtonIntent.Destructive}
                                onAction={() => onOpenDeleteModal(language)}
                            />
                        </MenuSection>
                    </Menu>
                )}
            </Box>
        </Box>
    )
}
