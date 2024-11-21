import classnames from 'classnames'
import _noop from 'lodash/noop'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import RichField from 'pages/common/forms/RichField/RichField'
import {AutoReplyReturnSettings} from 'state/rules/types'
import {THEME_TYPES} from 'theme'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

type Props = Pick<ManagedRuleDetailProps<AutoReplyReturnSettings>, 'settings'>

export const AutoReplyReturnDemo = ({settings}: Props) => (
    <div className={classnames(css.demo, css.autoReplyReturn)}>
        <div className={css.topbar}>
            <div className={css.circle} />
            <div className={css.circle} />
            <div className={css.circle} />
        </div>
        <div className={classnames(THEME_TYPES.Light, css.demoContent)}>
            <div className={css.textdata}>
                <div>
                    <div className={css.previewLegend}>
                        Message above return portal link
                    </div>
                    <div className={css.previewBodyWrapper}>
                        <RichField
                            value={{
                                text: settings.body_text,
                                html: settings.body_html,
                            }}
                            onChange={_noop}
                            displayOnly
                        />
                    </div>
                </div>
                <Button className={css.button}>Start a return</Button>
                <div>
                    <div className={css.previewLegend}>
                        Message below return portal link
                    </div>
                    <div className={css.previewBodyWrapper}>
                        <RichField
                            value={{
                                text: settings.signature_text,
                                html: settings.signature_html,
                            }}
                            onChange={_noop}
                            displayOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default AutoReplyReturnDemo
