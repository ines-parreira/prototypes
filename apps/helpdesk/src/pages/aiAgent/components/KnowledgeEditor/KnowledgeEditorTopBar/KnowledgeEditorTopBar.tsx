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

import { withTooltip } from './KnowledgeEditorTopBarCommonControls'
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
    autoSaveError?: boolean
    lastUpdatedDatetime?: Date

    guidanceMode?: GuidanceMode['mode']

    shouldHideFullscreenButton?: boolean
}

export const defaultProps: Props = {
    title: 'Help Center article',
    isFullscreen: false,
    onToggleFullscreen: () => {},
    onClose: () => {},
    isDetailsView: true,
    onToggleDetailsView: () => {},
    disabled: true,
    shouldHideFullscreenButton: false,
}

export const KnowledgeEditorTopBar = (props: Props) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.RelativeDateAndTime,
    )

    const isEditable = Boolean(
        props.onChangeTitle || props.guidanceMode === 'edit',
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
                {isEditable && !props.isSaving && props.autoSaveError && (
                    <span className={css.savingIndicator} tabIndex={0}>
                        <Tooltip placement="bottom">
                            <TooltipTrigger>
                                <Icon name="cloud-off" size={IconSize.Md} />
                            </TooltipTrigger>
                            <TooltipContent caption="Failed to save content." />
                        </Tooltip>
                    </span>
                )}
                {isEditable &&
                    !props.isSaving &&
                    !props.autoSaveError &&
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
                                    caption={`Last saved: ${formatDatetime(
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
                        {withTooltip(
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
                            />,
                            props.isDetailsView
                                ? 'Hide details'
                                : 'Show details',
                            !!props.disabled,
                        )}
                        <Separator direction="vertical" />
                    </>
                )}
                {!props.shouldHideFullscreenButton && (
                    <div className={css.fullscreenButton}>
                        {withTooltip(
                            <Button
                                onClick={props.onToggleFullscreen}
                                aria-label={
                                    props.isFullscreen
                                        ? 'leave fullscreen'
                                        : 'fullscreen'
                                }
                                isDisabled={props.disabled}
                                variant="tertiary"
                                icon={
                                    props.isFullscreen
                                        ? 'arrow-collapse'
                                        : 'arrow-expand'
                                }
                            />,
                            props.isFullscreen
                                ? 'Exit full screen'
                                : 'Enter full screen',
                            !!props.disabled,
                        )}
                    </div>
                )}

                {withTooltip(
                    <Button
                        onClick={props.onClose}
                        aria-label="close"
                        isDisabled={props.disabled}
                        variant="tertiary"
                        icon="close"
                    />,
                    'Close',
                    !!props.disabled,
                    'Esc',
                )}
            </Box>
        </div>
    )
}
