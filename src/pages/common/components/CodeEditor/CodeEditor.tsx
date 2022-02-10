import React, {useState} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

import Tooltip from '../Tooltip'

import css from './CodeEditor.less'
import ReactACE from './WithACEEditor/ReactACE'
import {EditorProps} from './WithACEEditor/types'

type Props = EditorProps & {
    title?: string
    tooltip?: string
    disabled?: boolean
}

function CodeEditor({title, tooltip, disabled, ...props}: Props) {
    const [id] = useState(_uniqueId('code-editor-'))
    const [tooltipId] = useState(_uniqueId('code-editor-tooltip-'))
    const [tooltipWrapperId] = useState(
        _uniqueId('code-editor-wrapper-tooltip-')
    )
    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <h4 className={css.title}>{title}</h4>
                {tooltip && (
                    <div>
                        <span id={tooltipId}>
                            <i className="material-icons">info_outline</i>
                        </span>
                        <Tooltip target={tooltipId} placement="top">
                            {tooltip}
                        </Tooltip>
                    </div>
                )}
            </div>
            <div id={tooltipWrapperId}>
                <div
                    className={classnames({
                        [css.codeWrapper]: true,
                        [css.codeDisabled]: disabled,
                    })}
                >
                    <ReactACE name={id} {...props} />
                </div>
            </div>
            {disabled && (
                <Tooltip target={tooltipWrapperId} placement="top">
                    Extra HTML disabled.
                </Tooltip>
            )}
        </div>
    )
}

export default CodeEditor
