import React, {useMemo} from 'react'

import {
    HelpCenter,
    HelpCenterTranslationSeoMeta,
} from '../../../../../../../models/helpCenter/types'
import InputField from '../../../../../../common/forms/InputField'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../../../utils/helpCenter.utils'
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
                label="Meta Title"
                value={seoMeta.title ?? ''}
                onChange={onEditSeoMeta('title')}
                help="Help center title is displayed in search engines to help people find it."
            />
            <InputField
                type="textarea"
                rows="2"
                name="seoDescription"
                label="Meta Description"
                value={seoMeta.description ?? ''}
                onChange={onEditSeoMeta('description')}
                help="Help center description is displayed in search engines to help people find it."
            />
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
