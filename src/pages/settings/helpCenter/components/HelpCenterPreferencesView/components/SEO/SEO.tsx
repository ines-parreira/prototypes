import React, {useEffect, useMemo} from 'react'

import {
    HelpCenter,
    HelpCenterTranslationSeoMeta,
    Locale,
    LocaleCode,
} from '../../../../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../../../../models/helpCenter/utils'
import InputField from '../../../../../../common/forms/InputField'
import SelectField from '../../../../../../common/forms/SelectField/SelectField'
import {useHelpCenterPreferencesSettings} from '../../../../providers/HelpCenterPreferencesSettings'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../../../utils/helpCenter.utils'
import {getLocaleSelectOptions} from '../../../../utils/localeSelectOptions'
import {SearchEnginePreview} from '../../../SearchEnginePreview'

import css from './SEO.less'

type Props = {
    helpCenter: HelpCenter
    availableLocales: Locale[]
    viewLanguage: LocaleCode
    onChangeLocale: (value: LocaleCode) => void
}

export const SEO = ({
    helpCenter,
    availableLocales,
    viewLanguage,
    onChangeLocale,
}: Props): JSX.Element => {
    const {preferences, updatePreferences} = useHelpCenterPreferencesSettings()

    const domain = useMemo(() => getHelpCenterDomain(helpCenter), [helpCenter])

    const supportedLocales = useMemo(
        () =>
            getLocaleSelectOptions(
                availableLocales,
                helpCenter.supported_locales
            ),
        [availableLocales, helpCenter.supported_locales]
    )

    const handleOnChangeLocale = (value: React.ReactText) => {
        onChangeLocale(validLocaleCode(value))
    }

    const onEditSeoMeta = (editKey: keyof HelpCenterTranslationSeoMeta) => (
        value: string
    ) => {
        updatePreferences({
            translation: {
                ...preferences.translation,
                seo_meta: {
                    ...preferences.translation.seo_meta,
                    [editKey]: value || null,
                },
            },
        })
    }

    useEffect(() => {
        const translation = helpCenter.translations?.find(
            (t) => t.locale === viewLanguage
        )

        if (translation) {
            updatePreferences({translation})
        }
    }, [helpCenter, viewLanguage])

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
                <SelectField
                    value={viewLanguage}
                    onChange={handleOnChangeLocale}
                    options={supportedLocales}
                    style={{display: 'inline-block'}}
                />
            </div>

            <InputField
                type="text"
                name="seoTitle"
                label="Meta Title"
                value={preferences.translation.seo_meta.title ?? ''}
                onChange={onEditSeoMeta('title')}
                help="Help center title is displayed in search engines to help people find it."
            />
            <InputField
                type="textarea"
                rows="2"
                name="seoDescription"
                label="Meta Description"
                value={preferences.translation.seo_meta.description ?? ''}
                onChange={onEditSeoMeta('description')}
                help="Help center description is displayed in search engines to help people find it."
            />
            <SearchEnginePreview
                baseUrl={getAbsoluteUrl({domain}, false)}
                title={
                    preferences.translation.seo_meta.title ||
                    `${helpCenter.name} Help Center`
                }
                description={
                    preferences.translation.seo_meta.description ||
                    `Home page of the ${helpCenter.name} Help Center`
                }
                help="This is a preview of how your help center is going to look like in search engines (e.g. Google, Duckduckgo, Bing...)"
            />
        </section>
    )
}
