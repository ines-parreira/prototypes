import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
    Box,
    Button,
    Icon,
    IconSize,
    LegacyLoadingSpinner as LoadingSpinner,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { KnowledgeEditorTopBarTitle } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarTitle'

import css from './SkillEditorHeader.less'

type Props = {
    title: string
    onChangeTitle?: (newTitle: string) => void
    onBack: () => void
    children?: React.ReactNode
    isSaving?: boolean
    autoSaveError?: boolean
    lastUpdatedDatetime?: Date
}

export const SkillEditorHeader = ({
    title,
    onChangeTitle,
    onBack,
    children,
    isSaving,
    autoSaveError,
    lastUpdatedDatetime,
}: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    const isEditable = Boolean(onChangeTitle)

    return (
        <Box
            alignItems="center"
            justifyContent="space-between"
            padding="lg"
            height="80px"
        >
            <Box alignItems="center" gap="sm" flex={1} minWidth={0}>
                <Button
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    aria-label="Back to skills"
                    onClick={onBack}
                />
                <div className={css.titleArea}>
                    <KnowledgeEditorTopBarTitle
                        onChangeTitle={onChangeTitle}
                        title={title}
                    />
                    {isSaving && (
                        <span className={css.savingIndicator}>
                            <LoadingSpinner size="small" />
                            Saving
                        </span>
                    )}
                    {isEditable && !isSaving && autoSaveError && (
                        <span className={css.savingIndicator} tabIndex={0}>
                            <Tooltip
                                placement="bottom"
                                trigger={
                                    <Icon name="cloud-off" size={IconSize.Md} />
                                }
                            >
                                <TooltipContent caption="Failed to save content." />
                            </Tooltip>
                        </span>
                    )}
                    {isEditable &&
                        !isSaving &&
                        !autoSaveError &&
                        lastUpdatedDatetime && (
                            <span className={css.savingIndicator} tabIndex={0}>
                                <Tooltip
                                    placement="bottom"
                                    trigger={
                                        <Icon
                                            name="cloud-check"
                                            size={IconSize.Md}
                                        />
                                    }
                                >
                                    <TooltipContent
                                        caption={`Last saved: ${formatDatetime(
                                            lastUpdatedDatetime.toISOString(),
                                            datetimeFormat,
                                            Intl.DateTimeFormat().resolvedOptions()
                                                .timeZone,
                                        )}`}
                                    />
                                </Tooltip>
                            </span>
                        )}
                </div>
            </Box>
            <Box gap="xs" alignItems="center">
                {children}
            </Box>
        </Box>
    )
}
