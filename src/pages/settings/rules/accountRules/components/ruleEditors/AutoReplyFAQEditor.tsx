import React from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {Map, fromJS} from 'immutable'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {AutoReplyFAQSettings, ManagedRulesSlugs} from 'state/rules/types'
import FakeFAQArticlePreview from 'pages/settings/rules/components/FakeFAQArticlePreview'
import RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import SetResponseTextAction from 'pages/tickets/common/macros/components/actions/SetResponseTextAction'
import {HelpCenter} from 'models/helpCenter/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import LinkToRecipeView from './LinkToRecipeView'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'
import css from './ManagedRuleEditor.less'

type HelpCenterDropdownProps = {
    selectedValue: number
    helpCenters: HelpCenter[]
    onChange: (helpCenterId: Value) => void
}

const HelpCenterSelectField = ({
    selectedValue,
    helpCenters,
    onChange,
}: HelpCenterDropdownProps) => {
    const options = helpCenters.map(
        (helpCenter) =>
            ({
                value: helpCenter.id,
                label: helpCenter.name,
                text: helpCenter.name,
            } as Option)
    )
    return (
        <SelectField
            options={options}
            onChange={onChange}
            value={selectedValue}
            required={true}
            fullWidth
        />
    )
}

export const AutoReplyFAQEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoReplyFAQSettings>) => {
    const handleChange = onChange()
    const helpCenters = useAppSelector(getActiveHelpCenterList)

    const handleBlocklist = (block_list: string[]) => {
        if (!handleChange) {
            return
        }
        void handleChange({...settings, block_list: block_list})
    }

    const handleBodyChange = (index: number, args: Map<string, any>) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            body_html: args.get('body_html'),
            body_text: args.get('body_text'),
        })
    }

    const handleSignatureChange = (index: number, args: Map<string, any>) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            signature_html: args.get('body_html'),
            signature_text: args.get('body_text'),
        })
    }

    const handleChangeHelpCenter = (helpCenterId: Value) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            help_center_id: helpCenterId as number,
        })
    }

    return (
        <div className={classnames(css.container, css.autoReplyFAQ)}>
            <div className={css.descriptionWrapper}>
                <h3>Rule description</h3>
                <p>
                    Automatically reply to common shopper questions with
                    relevant help center article suggestions.
                </p>
                <p>
                    <LinkToRecipeView
                        recipeSlug={ManagedRulesSlugs.AutoReplyFAQ}
                    >
                        You can see tickets closed by this rule anytime using
                        this link
                    </LinkToRecipeView>
                </p>
                {helpCenters.length > 1 && (
                    <Alert type={AlertType.Warning} icon>
                        You have more than 1 help center. Ensure the desired
                        help center is selected below.
                    </Alert>
                )}
                {helpCenters.length > 1 && (
                    <div className={css.listWrapper}>
                        <h4>Help Center</h4>
                        <HelpCenterSelectField
                            helpCenters={helpCenters}
                            onChange={handleChangeHelpCenter}
                            selectedValue={settings.help_center_id!}
                        />
                    </div>
                )}
                <div className={css.listWrapper}>
                    <h4>Exclusion email list</h4>
                    <p>
                        Emails in the following list will never be replied to by
                        this auto reply rule.
                    </p>
                    <MultiSelectField
                        allowCustomValues={true}
                        values={settings.block_list}
                        onChange={handleBlocklist}
                        className={css.blockList}
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Message above article preview</h4>
                    <SetResponseTextAction
                        action={fromJS({
                            arguments: {
                                body_text: settings.body_text,
                                body_html: settings.body_html,
                            },
                        })}
                        index={0}
                        updateActionArgs={handleBodyChange}
                        ignoredVariables={['shopify']}
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Message below article preview</h4>
                    <SetResponseTextAction
                        action={fromJS({
                            arguments: {
                                body_text: settings.signature_text,
                                body_html: settings.signature_html,
                            },
                        })}
                        index={1}
                        updateActionArgs={handleSignatureChange}
                        ignoredVariables={['shopify']}
                    />
                </div>
            </div>
            <div className={css.demo}>
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
        </div>
    )
}

export default AutoReplyFAQEditor
