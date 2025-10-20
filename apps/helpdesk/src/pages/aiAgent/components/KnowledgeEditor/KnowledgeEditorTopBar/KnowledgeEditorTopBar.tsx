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

    isUpdating: boolean
}

export const KnowledgeEditorTopBar = (props: Props) => {
    return (
        <div className={css.container}>
            <div className={css.navigationControls}>
                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.ghostButton,
                    )}
                    onClick={props.onClickPrevious}
                    disabled={
                        props.onClickPrevious === undefined || props.isUpdating
                    }
                    aria-label="previous"
                >
                    <Icon name="arrow-chevron-left" />
                </button>
                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.ghostButton,
                    )}
                    onClick={props.onClickNext}
                    disabled={
                        props.onClickNext === undefined || props.isUpdating
                    }
                    aria-label="next"
                >
                    <Icon name="arrow-chevron-right" />
                </button>
            </div>

            <div className={css.title}>
                <KnowledgeEditorTopBarTitle
                    onChangeTitle={
                        props.isUpdating ? undefined : props.onChangeTitle
                    }
                    title={props.title}
                />
            </div>

            <div className={controlsCss.container}>
                {props.children && (
                    <>
                        {props.children}
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
                    disabled={props.isUpdating}
                >
                    <Icon
                        name={
                            props.isFullscreen ? 'arrow-shrink' : 'arrow-expand'
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
                    disabled={props.isUpdating}
                >
                    <Icon name="close" />
                </button>

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
                    disabled={props.isUpdating}
                >
                    <Icon
                        name={
                            props.isDetailsView
                                ? 'system-bar-collapsed'
                                : 'system-bar-expanded'
                        }
                    />
                </button>
            </div>
        </div>
    )
}
