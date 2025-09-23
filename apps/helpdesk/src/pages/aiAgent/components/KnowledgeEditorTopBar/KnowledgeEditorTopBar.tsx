import classNames from 'classnames'

import arrowExpand from 'assets/img/knowledge/icons/arrow-expand.svg'
import arrowShrink from 'assets/img/knowledge/icons/arrow-shrink.svg'
import chevronLeft from 'assets/img/knowledge/icons/chevron-left.svg'
import chevronRight from 'assets/img/knowledge/icons/chevron-right.svg'
import close from 'assets/img/knowledge/icons/close.svg'
import systemBarCollapse from 'assets/img/knowledge/icons/system-bar-collapse.svg'
import systemBarExpand from 'assets/img/knowledge/icons/system-bar-expand.svg'

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
                    disabled={props.onClickPrevious === undefined}
                >
                    <img src={chevronLeft} alt="previous" />
                </button>
                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.ghostButton,
                    )}
                    onClick={props.onClickNext}
                    disabled={props.onClickNext === undefined}
                >
                    <img src={chevronRight} alt="next" />
                </button>
            </div>

            <div className={css.title}>
                <KnowledgeEditorTopBarTitle
                    onChangeTitle={props.onChangeTitle}
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
                        controlsCss.filledButton,
                    )}
                    onClick={props.onToggleFullscreen}
                >
                    <img
                        src={props.isFullscreen ? arrowShrink : arrowExpand}
                        alt={
                            props.isFullscreen
                                ? 'leave fullscreen'
                                : 'fullscreen'
                        }
                    />
                </button>

                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.filledButton,
                    )}
                    onClick={props.onClose}
                >
                    <img src={close} alt="close" />
                </button>

                <button
                    className={classNames(
                        controlsCss.icon,
                        controlsCss.ghostButton,
                    )}
                    onClick={props.onToggleDetailsView}
                >
                    <img
                        src={
                            props.isDetailsView
                                ? systemBarCollapse
                                : systemBarExpand
                        }
                        alt={
                            props.isDetailsView
                                ? 'collapse side panel'
                                : 'expand side panel'
                        }
                    />
                </button>
            </div>
        </div>
    )
}
