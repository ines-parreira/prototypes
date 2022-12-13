import React from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {AutoReplyFAQSettings} from 'state/rules/types'
import FakeFAQArticlePreview from 'pages/settings/rules/components/FakeFAQArticlePreview'
import RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'
import css from './ManagedRuleEditor.less'

type Props = Pick<ManagedRuleDetailProps<AutoReplyFAQSettings>, 'settings'>

export const AutoReplyFAQDemo = ({settings}: Props) => {
    return (
        <div className={classnames(css.demo, css.autoReplyFAQ)}>
            <div className={css.topbar}>
                <div className={css.circle} />
                <div className={css.circle} />
                <div className={css.circle} />
            </div>
            <div className={css.demoContent}>
                <div className={css.textdata}>
                    <div>
                        <div className={css.previewLegend}>
                            Message above article preview
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
                    <FakeFAQArticlePreview />
                    <div>
                        <div className={css.previewLegend}>
                            Message below article preview
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
}

export default AutoReplyFAQDemo
