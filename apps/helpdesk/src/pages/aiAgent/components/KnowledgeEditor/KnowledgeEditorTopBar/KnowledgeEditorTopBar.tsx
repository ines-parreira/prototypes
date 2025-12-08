import classNames from 'classnames'

import { Icon } from '@gorgias/axiom'

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
                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.secondaryButton,
                    )}
                    onClick={props.onToggleFullscreen}
                    aria-label={
                        props.isFullscreen ? 'leave fullscreen' : 'fullscreen'
                    }
                    disabled={props.disabled}
                >
                    <Icon
                        name={
                            props.isFullscreen
                                ? 'arrow-collapse'
                                : 'arrow-expand'
                        }
                    />
                </button>

                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.secondaryButton,
                    )}
                    onClick={props.onClose}
                    aria-label="close"
                    disabled={props.disabled}
                >
                    <Icon name="close" />
                </button>
            </div>
        </div>
    )
}
