import React from 'react'
import classnames from 'classnames'

import _noop from 'lodash/noop'
import {AutoReplyWismoSettings} from 'state/rules/types'
import RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'

import {FakeOrderTracking} from 'pages/settings/rules/components/FakeOrderTracking'
import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

type Props = Pick<ManagedRuleDetailProps<AutoReplyWismoSettings>, 'settings'>

export const AutoReplyWismoDemo = ({settings}: Props) => (
    <div className={classnames(css.demo, css.autoReplyWismo)}>
        <div className={css.topbar}>
            <div className={css.circle} />
            <div className={css.circle} />
            <div className={css.circle} />
        </div>
        <div className={css.demoContent}>
            <div className={css.textdata}>
                <div>
                    <div className={css.previewLegend}>
                        Message above tracking links
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
                <FakeOrderTracking />
                <div>
                    <div className={css.previewLegend}>
                        Message below tracking links
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

export default AutoReplyWismoDemo
