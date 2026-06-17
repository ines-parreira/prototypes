import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'
import classNames from 'classnames'

import {
    Box,
    Button,
    Icon,
    IconSize,
    LegacyLoadingSpinner as LoadingSpinner,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useGetDateAndTimeFormat } from 'hooks/useGetDateAndTimeFormat'
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
    isPreview?: boolean
    titleAnchorProps?: { 'data-copilot-anchor': string }
    statusAnchorProps?: { 'data-copilot-anchor': string }
}

export const SkillEditorHeader = ({
    title,
    onChangeTitle,
    onBack,
    children,
    isSaving,
    autoSaveError,
    lastUpdatedDatetime,
    isPreview,
    titleAnchorProps,
    statusAnchorProps,
}: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    const isEditable = Boolean(onChangeTitle)

    return (
        <Box
            alignItems="center"
            justifyContent="space-between"
            padding={!isPreview ? 'lg' : undefined}
            gap="sm"
            minWidth={0}
            className={isPreview ? css.header : undefined}
        >
            <Box alignItems="center" gap="sm" flex={1} minWidth={0}>
                {!isPreview && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon="arrow-left"
                        aria-label="Back to skills"
                        onClick={onBack}
                    />
                )}
                <Box
                    className={classNames(
                        css.titleArea,
                        isPreview && css.previewHeader,
                    )}
                >
                    <KnowledgeEditorTopBarTitle
                        onChangeTitle={onChangeTitle}
                        title={title}
                        anchorProps={titleAnchorProps}
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
                </Box>
            </Box>
            <Box gap="xs" alignItems="center" {...statusAnchorProps}>
                {children}
            </Box>
        </Box>
    )
}
