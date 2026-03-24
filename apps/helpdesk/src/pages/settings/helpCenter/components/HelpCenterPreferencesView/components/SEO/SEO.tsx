import type React from 'react'
import { useMemo } from 'react'

import type {
    HelpCenter,
    HelpCenterTranslationSeoMeta,
} from 'models/helpCenter/types'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import { useHelpCenterPreferencesSettings } from 'pages/settings/helpCenter/providers/HelpCenterPreferencesSettings/HelpCenterPreferencesSettings'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import settingsCss from 'pages/settings/settings.less'

import { SearchEnginePreview } from '../../../SearchEnginePreview'

import css from './SEO.less'

type Props = {
    helpCenter: HelpCenter
}

export const SEO: React.FC<Props> = ({ helpCenter }: Props) => {
    const {
        preferences: { seoMeta },
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
        <section className={css.container}>
            <div className={css.heading}>
                <h3>Search Engine Optimization (SEO)</h3>
                <p>
                    Allow you to add tracking links and other scripts to your
                    Help Center page.
                </p>
            </div>

            <InputField
                type="text"
                name="seoTitle"
                className={settingsCss.mb16}
                label="Meta Title"
                value={seoMeta.title ?? ''}
                onChange={onEditSeoMeta('title')}
                caption="Help Center title is displayed in search engines to help people find it."
            />
            <TextArea
                rows={2}
                className={settingsCss.mb16}
                name="seoDescription"
                label="Meta Description"
                value={seoMeta.description ?? ''}
                onChange={onEditSeoMeta('description')}
                caption="Help Center description is displayed in search engines to help people find it."
            />
            <SearchEnginePreview
                baseUrl={getAbsoluteUrl({ domain }, false)}
                title={seoMeta.title || `${helpCenter.name} Help Center`}
                description={
                    seoMeta.description ||
                    `Home page of the ${helpCenter.name} Help Center`
                }
                help="This is a preview of how your article is going to look like in search engines (e.g. Google, Duckduckgo, Bing...)"
            />
        </section>
    )
}
