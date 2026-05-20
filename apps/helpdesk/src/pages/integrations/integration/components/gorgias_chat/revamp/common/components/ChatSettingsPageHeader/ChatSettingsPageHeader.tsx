import { useMemo } from 'react'

import { Link, useHistory } from 'react-router-dom'

import {
    Breadcrumb,
    Breadcrumbs,
    Button,
    PanelHeader,
    Text,
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

export const ChatSettingsPageHeader = ({
    breadcrumbItems = [],
    backButtonLink,
    showBackButton = true,
    onSave,
    isSaveDisabled,
    isSaveLoading,
    title,
}: Props) => {
    const history = useHistory()

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
                            <Text size="sm">
                                <Link
                                    className={css.breadcrumbLink}
                                    to={item.link}
                                >
                                    {item.label}
                                </Link>
                            </Text>
                        ) : (
                            <Text size="sm" variant="medium">
                                {item.label}
                            </Text>
                        )}
                    </Breadcrumb>
                )}
            </Breadcrumbs>
            <PanelHeader
                leadingSlot={
                    showBackButton && _backButtonlink ? (
                        <Button
                            icon="arrow-left"
                            size="sm"
                            variant="secondary"
                            aria-label="Go back"
                            onClick={() => history.push(_backButtonlink)}
                        />
                    ) : undefined
                }
                title={title}
                p={0}
                trailingSlot={
                    onSave ? (
                        <Button
                            onClick={onSave}
                            isDisabled={isSaveDisabled}
                            isLoading={isSaveLoading}
                        >
                            Save
                        </Button>
                    ) : undefined
                }
            />
        </div>
    )
}
