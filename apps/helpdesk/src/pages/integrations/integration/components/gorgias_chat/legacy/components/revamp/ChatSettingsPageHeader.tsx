import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import {
    Breadcrumb,
    Breadcrumbs,
    Button,
    ButtonAs,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Heading,
    HeadingSize,
    IconName,
    Text,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'

import css from './ChatSettingsPageHeader.less'

export type ChatSettingsBreadcrumbItem = {
    link?: string
    label: string
    id: string
}

type Props = {
    breadcrumbItems?: ChatSettingsBreadcrumbItem[]
    backButtonLink?: string
    showBackButton?: boolean
    title: string
    onSave?: () => void
    isSaveDisabled?: boolean
    isSaveLoading?: boolean
}

const ChatSettingsPageHeader = ({
    breadcrumbItems = [],
    backButtonLink,
    showBackButton = true,
    onSave,
    isSaveDisabled,
    isSaveLoading,
    title,
}: Props) => {
    const _backButtonlink = useMemo<string | null>(() => {
        if (backButtonLink) {
            return backButtonLink
        }

        for (let i = breadcrumbItems.length - 1; i >= 0; i--) {
            if (breadcrumbItems[i].link) {
                return breadcrumbItems[i].link as string
            }
        }

        return null
    }, [breadcrumbItems, backButtonLink])

    return (
        <div className={css.pageHeader}>
            <Breadcrumbs items={[...breadcrumbItems]}>
                {(item) => (
                    <Breadcrumb>
                        {item.link ? (
                            <Text size={TextSize.Sm}>
                                <Link
                                    className={css.breadcrumbLink}
                                    to={item.link}
                                >
                                    {item.label}
                                </Link>
                            </Text>
                        ) : (
                            <Text
                                size={TextSize.Sm}
                                variant={TextVariant.Medium}
                            >
                                {item.label}
                            </Text>
                        )}
                    </Breadcrumb>
                )}
            </Breadcrumbs>
            <div className={css.content}>
                <div className={css.title}>
                    {showBackButton && _backButtonlink && (
                        <Link
                            to={_backButtonlink}
                            data-testid="chat-settings-header-back-button"
                        >
                            <Button
                                as={ButtonAs.Anchor}
                                icon={IconName.ArrowLeft}
                                intent={ButtonIntent.Regular}
                                size={ButtonSize.Md}
                                variant={ButtonVariant.Secondary}
                            ></Button>
                        </Link>
                    )}

                    <Heading size={HeadingSize.Xl}>{title}</Heading>
                </div>
                {onSave && (
                    <div
                        className={css.actionButton}
                        data-testid="chat-settings-header-action-button"
                    >
                        <Button
                            intent={ButtonIntent.Regular}
                            variant={ButtonVariant.Primary}
                            as={ButtonAs.Button}
                            size={ButtonSize.Md}
                            onClick={onSave}
                            isDisabled={isSaveDisabled}
                            isLoading={isSaveLoading}
                        >
                            Save
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatSettingsPageHeader
