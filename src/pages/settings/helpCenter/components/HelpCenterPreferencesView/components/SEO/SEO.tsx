import React, {useMemo} from 'react'

import InputField from 'pages/common/forms/input/InputField'
import {HelpCenter, HelpCenterTranslationSeoMeta} from 'models/helpCenter/types'
import TextArea from 'pages/common/forms/TextArea'
import {useHelpCenterPreferencesSettings} from 'pages/settings/helpCenter/providers/HelpCenterPreferencesSettings'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

import settingsCss from 'pages/settings/settings.less'

import {SearchEnginePreview} from '../../../SearchEnginePreview'

import css from './SEO.less'

type Props = {
    helpCenter: HelpCenter
}

export const SEO: React.FC<Props> = ({helpCenter}: Props) => {
    const {
        preferences: {seoMeta},
        updatePreferences,
    } = useHelpCenterPreferencesSettings()

    const domain = useMemo(() => getHelpCenterDomain(helpCenter), [helpCenter])

    const onEditSeoMeta =
        (editKey: keyof HelpCenterTranslationSeoMeta) => (value: string) => {
            updatePreferences({
                seoMeta: {
                    ...seoMeta,
                    [editKey]: value || null,
                },
            })
        }

    return (
        <section>
            <div className={css.heading}>
                <div>
                    <h3>Search Engine Optimization (SEO)</h3>
                    <p>
                        Allow you to add tracking links and other scripts to
                        your help center page.
                    </p>
                </div>
            </div>

            <InputField
                type="text"
                name="seoTitle"
                className={settingsCss.mb16}
                label="Meta Title"
                value={seoMeta.title ?? ''}
                onChange={onEditSeoMeta('title')}
                caption="Help center title is displayed in search engines to help people find it."
            />
            <TextArea
                rows={2}
                className={settingsCss.mb16}
                name="seoDescription"
                label="Meta Description"
                onChange={onEditSeoMeta('description')}
                caption="Help center description is displayed in search engines to help people find it."
            >
                {seoMeta.description ?? ''}
            </TextArea>
            <SearchEnginePreview
                baseUrl={getAbsoluteUrl({domain}, false)}
                title={seoMeta.title || `${helpCenter.name} Help Center`}
                description={
                    seoMeta.description ||
                    `Home page of the ${helpCenter.name} Help Center`
                }
                help="This is a preview of how your help center is going to look like in search engines (e.g. Google, Duckduckgo, Bing...)"
            />
        </section>
    )
}
