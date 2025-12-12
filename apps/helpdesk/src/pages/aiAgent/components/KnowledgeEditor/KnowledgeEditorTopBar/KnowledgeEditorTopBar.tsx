import classNames from 'classnames'

import {
    Button,
    Icon,
    IconSize,
    LegacyLoadingSpinner as LoadingSpinner,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { formatDatetime } from 'utils'

import type { GuidanceMode } from './KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorTopBarTitle } from './KnowledgeEditorTopBarTitle'

import css from './KnowledgeEditorTopBar.less'
import controlsCss from './KnowledgeEditorTopBarControls.less'

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
            <div className={css.navigationControls}>
                {props.onClickPrevious && (
                    <button
                        className={classNames(
                            controlsCss.icon,
                            controlsCss.ghostButton,
                        )}
                        onClick={props.onClickPrevious}
                        disabled={props.disabled}
                        aria-label="previous"
                    >
                        <Icon name="arrow-chevron-left" />
                    </button>
                )}
                {props.onClickNext && (
                    <button
                        className={classNames(
                            controlsCss.icon,
                            controlsCss.ghostButton,
                        )}
                        onClick={props.onClickNext}
                        disabled={props.disabled}
                        aria-label="next"
                    >
                        <Icon name="arrow-chevron-right" />
                    </button>
                )}
            </div>

            <div
                className={classNames(
                    css.title,
                    props.onChangeTitle && !props.disabled
                        ? css.editableTitle
                        : undefined,
                )}
            >
                <KnowledgeEditorTopBarTitle
                    onChangeTitle={
                        props.disabled ? undefined : props.onChangeTitle
                    }
                    title={props.title}
                />
                {props.isSaving && (
                    <span className={css.savingIndicator}>
                        <LoadingSpinner size="small" />
                        Saving
                    </span>
                )}
                {props.guidanceMode === 'edit' &&
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

            <div className={controlsCss.container}>
                {props.children && (
                    <>
                        {props.children}
                        <button
                            className={classNames(
                                controlsCss.icon,
                                controlsCss.ghostButton,
                            )}
                            onClick={props.onToggleDetailsView}
                            aria-label={
                                props.isDetailsView
                                    ? 'collapse side panel'
                                    : 'expand side panel'
                            }
                            disabled={props.disabled}
                        >
                            <Icon
                                name={
                                    props.isDetailsView
                                        ? 'system-bar-collapse'
                                        : 'system-bar-expand'
                                }
                                size={'lg'}
                            />
                        </button>
                        <div className={controlsCss.separator} />
                    </>
                )}
                <Button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.secondaryButton,
                    )}
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
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.secondaryButton,
                    )}
                    onClick={props.onClose}
                    aria-label="close"
                    isDisabled={props.disabled}
                    variant="tertiary"
                    icon="close"
                />
            </div>
        </div>
    )
}
