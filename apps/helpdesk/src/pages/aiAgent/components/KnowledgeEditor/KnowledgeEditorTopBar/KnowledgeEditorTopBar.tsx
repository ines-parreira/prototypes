import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
    Box,
    Button,
    Icon,
    IconSize,
    LegacyLoadingSpinner as LoadingSpinner,
    Separator,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import type { GuidanceMode } from './KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorTopBarTitle } from './KnowledgeEditorTopBarTitle'

import css from './KnowledgeEditorTopBar.less'

type Props = {
    onClickPrevious?: () => void
    onClickNext?: () => void

    title: string // e.g. Guidance, Help Center article
    onChangeTitle?: (newTitle: string) => void // if not undefined, field is editable

    children?: React.ReactNode

    isFullscreen: boolean
    onToggleFullscreen: () => void

    onClose: () => void

    isDetailsView: boolean
    onToggleDetailsView: () => void

    disabled?: boolean

    isSaving?: boolean
    lastUpdatedDatetime?: Date

    guidanceMode?: GuidanceMode['mode']
}

export const defaultProps: Props = {
    title: 'Help Center article',
    isFullscreen: false,
    onToggleFullscreen: () => {},
    onClose: () => {},
    isDetailsView: true,
    onToggleDetailsView: () => {},
    disabled: true,
}

export const KnowledgeEditorTopBar = (props: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    return (
        <div
            className={css.container}
            data-name={'knowledge-editor-top-bar-container'}
        >
            {(props.onClickPrevious || props.onClickNext) && (
                <Box gap="xs">
                    {props.onClickPrevious && (
                        <Button
                            onClick={props.onClickPrevious}
                            isDisabled={props.disabled}
                            aria-label="previous"
                            variant="secondary"
                            icon="arrow-chevron-left"
                        />
                    )}
                    {props.onClickNext && (
                        <Button
                            onClick={props.onClickNext}
                            isDisabled={props.disabled}
                            aria-label="next"
                            variant="secondary"
                            icon="arrow-chevron-right"
                        />
                    )}
                </Box>
            )}
            <div className={css.title}>
                <KnowledgeEditorTopBarTitle
                    onChangeTitle={props.onChangeTitle}
                    title={props.title}
                />
                {props.isSaving && (
                    <span className={css.savingIndicator}>
                        <LoadingSpinner size="small" />
                        Saving
                    </span>
                )}
                {(props.onChangeTitle || props.guidanceMode === 'edit') &&
                    !props.isSaving &&
                    props.lastUpdatedDatetime && (
                        <span className={css.savingIndicator} tabIndex={0}>
                            <Tooltip placement="bottom">
                                <TooltipTrigger>
                                    <Icon
                                        name="cloud-check"
                                        size={IconSize.Md}
                                    />
                                </TooltipTrigger>
                                <TooltipContent
                                    title={`Last saved: ${formatDatetime(
                                        props.lastUpdatedDatetime.toISOString(),
                                        datetimeFormat,
                                        Intl.DateTimeFormat().resolvedOptions()
                                            .timeZone,
                                    )}`}
                                />
                            </Tooltip>
                        </span>
                    )}
            </div>

            <Box gap="xs">
                {props.children && (
                    <>
                        {props.children}
                        <Button
                            onClick={props.onToggleDetailsView}
                            aria-label={
                                props.isDetailsView
                                    ? 'collapse side panel'
                                    : 'expand side panel'
                            }
                            isDisabled={props.disabled}
                            variant="tertiary"
                            icon={
                                props.isDetailsView
                                    ? 'system-bar-collapse'
                                    : 'system-bar-expand'
                            }
                        />
                        <Separator direction="vertical" />
                    </>
                )}
                <Button
                    onClick={props.onToggleFullscreen}
                    aria-label={
                        props.isFullscreen ? 'leave fullscreen' : 'fullscreen'
                    }
                    isDisabled={props.disabled}
                    variant="tertiary"
                    icon={
                        props.isFullscreen ? 'arrow-collapse' : 'arrow-expand'
                    }
                />

                <Button
                    onClick={props.onClose}
                    aria-label="close"
                    isDisabled={props.disabled}
                    variant="tertiary"
                    icon="close"
                />
            </Box>
        </div>
    )
}
