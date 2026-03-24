import React, { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import classNames from 'classnames'
import { FormGroup } from 'reactstrap'
import type { IsURLOptions } from 'validator/lib/isURL'
import isURL from 'validator/lib/isURL'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type {
    ExtraHTMLDto,
    LocalSocialNavigationLink,
    NavigationLink,
} from 'models/helpCenter/types'
import InputField from 'pages/common/forms/input/InputField'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { helpCenterUpdated } from 'state/entities/helpCenter/helpCenters/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getViewLanguage } from 'state/ui/helpCenter'

import CodeEditor from '../../../common/components/CodeEditor/CodeEditor'
import { ExtraHtmlSection } from '../../../common/components/ExtraHtmlSection/ExtraHtmlSection'
import ToggleInput from '../../../common/forms/ToggleInput'
import { SocialNavigationLinks } from '../components/SocialNavigationLinks'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    SOCIAL_NAVIGATION_LINKS,
} from '../constants'
import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import { useHelpCenterApi } from '../hooks/useHelpCenterApi'
import { useHelpCenterIdParam } from '../hooks/useHelpCenterIdParam'
import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
import { getAbsoluteUrl } from '../utils/helpCenter.utils'
import { saveNavigationLinks, saveSocialLinks } from '../utils/navigationLinks'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import { LinkList } from './LinkList'
import { UpdateToggle } from './UpdateToggle'

import css from './HelpCenterCustomizationView.less'

export const HelpCenterCustomizationView = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const { client } = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()
    const selectedLocale =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [links, setLinks] = useState<NavigationLink[]>([])
    const [extraHTML, setExtraHTML] = useState<ExtraHTMLDto | null>(null)
    const [logoHyperlink, setLogoHyperlink] = useState<string>('')
    const [logoHyperlinkErrMessage, setLogoHyperlinkErrMessage] =
        useState<string>('')

    const isHelpCenterLogoHyperlinkEnabled = useFlag(
        FeatureFlagKey.HelpCenterLogoHyperlink,
    )
    const isURLOptions: IsURLOptions = {
        require_host: true,
    }
    const [isDirty, setIsDirty] = useState(false)

    useEffect(() => {
        async function init() {
            if (client && selectedLocale) {
                await client
                    .getExtraHTML({
                        help_center_id: helpCenterId,
                        locale: selectedLocale,
                    })
                    .then((response) => {
                        const {
                            custom_footer_deactivated_datetime,
                            custom_header_deactivated_datetime,
                            extra_head_deactivated_datetime,
                            ...rest
                        } = response.data
                        setExtraHTML({
                            ...rest,
                            custom_footer_deactivated:
                                custom_footer_deactivated_datetime !== null,
                            custom_header_deactivated:
                                custom_header_deactivated_datetime !== null,
                            extra_head_deactivated:
                                extra_head_deactivated_datetime !== null,
                        })
                    })
                await client
                    .listNavigationLinks({
                        help_center_id: helpCenterId,
                        locale: selectedLocale,
                    })
                    .then((response) => setLinks(response.data.data))
            }
        }

        void init()
    }, [helpCenterId, selectedLocale, client])

    const translation = useMemo(() => {
        return helpCenter.translations?.find((t) => t.locale === selectedLocale)
    }, [helpCenter.translations, selectedLocale])

    useEffect(() => {
        setLogoHyperlink(translation?.logo_hyperlink || '')
    }, [translation])

    const linksWithoutSocial = useMemo(
        () =>
            links.filter((link) =>
                link.meta?.network
                    ? !Object.keys(SOCIAL_NAVIGATION_LINKS).includes(
                          link.meta?.network,
                      )
                    : true,
            ),
        [links],
    )

    const socialLinks = useMemo(
        () =>
            Object.entries(
                SOCIAL_NAVIGATION_LINKS,
            ).map<LocalSocialNavigationLink>(([socialKey, socialLink]) => {
                const currentRemoteLink = links.find((link) =>
                    link.meta?.network
                        ? socialKey === link.meta.network.toLowerCase()
                        : false,
                )

                if (currentRemoteLink) {
                    return {
                        id: currentRemoteLink.id,
                        label: currentRemoteLink.label,
                        value: currentRemoteLink.value,
                        group: currentRemoteLink.group,
                        meta: currentRemoteLink.meta,
                        created_datetime: currentRemoteLink.created_datetime,
                        updated_datetime: currentRemoteLink.updated_datetime,
                    }
                }

                return socialLink
            }),
        [links],
    )

    const headerNavigation = useNavigationLinks('header', linksWithoutSocial)
    const footerNavigation = useNavigationLinks('footer', linksWithoutSocial)
    const socialNavigation = useSocialNavigationLinks(socialLinks, {
        allowEmpty: true,
    })

    const handleOnReset = () => {
        headerNavigation.resetFields()
        footerNavigation.resetFields()
        socialNavigation.resetFields()
        setLogoHyperlink(translation?.logo_hyperlink || '')
        setLogoHyperlinkErrMessage('')
        setIsDirty(false)
    }
    const handleSaveLinks = async () => {
        if (client) {
            await saveNavigationLinks(
                client,
                linksWithoutSocial,
                headerNavigation.links.filter(
                    (link) => link.label && link.value,
                ),
                {
                    group: 'header',
                    helpCenterId: helpCenterId,
                    locale: selectedLocale,
                },
            )

            await saveNavigationLinks(
                client,
                linksWithoutSocial,
                footerNavigation.links.filter(
                    (link) => link.label && link.value,
                ),
                {
                    group: 'footer',
                    helpCenterId: helpCenterId,
                    locale: selectedLocale,
                },
            )

            await saveSocialLinks(client, socialNavigation.links, {
                helpCenterId: helpCenterId,
                locale: selectedLocale,
            })

            const navigationLinks = await client.listNavigationLinks({
                help_center_id: helpCenterId,
                locale: selectedLocale,
            })

            setLinks(navigationLinks.data.data)
        }
    }

    const handleSaveExtraHTML = async () => {
        if (client && extraHTML) {
            const response = await client.updateExtraHTML(
                {
                    help_center_id: helpCenterId,
                    locale: selectedLocale,
                },
                extraHTML,
            )
            const {
                custom_footer_deactivated_datetime,
                custom_header_deactivated_datetime,
                extra_head_deactivated_datetime,
                ...rest
            } = response.data

            setExtraHTML({
                ...rest,
                custom_footer_deactivated:
                    custom_footer_deactivated_datetime !== null,
                custom_header_deactivated:
                    custom_header_deactivated_datetime !== null,
                extra_head_deactivated:
                    extra_head_deactivated_datetime !== null,
            })
        }
    }

    const handleSaveHyperlink = async () => {
        if (client && isLogoHyperlinkUpdated) {
            if (logoHyperlinkErrMessage) {
                void dispatch(
                    notify({
                        message: 'URL is invalid',
                        status: NotificationStatus.Error,
                    }),
                )

                throw new Error('URL is invalid')
            }

            let translations = helpCenter.translations
            const { data: updatedTranslation } =
                await client.updateHelpCenterTranslation(
                    {
                        help_center_id: helpCenterId,
                        locale: selectedLocale,
                    },
                    {
                        logo_hyperlink:
                            logoHyperlink === ''
                                ? null
                                : getAbsoluteUrl(
                                      { domain: logoHyperlink },
                                      false,
                                  ),
                    },
                )

            translations = helpCenter.translations?.map((translation) =>
                translation.locale === updatedTranslation.locale
                    ? updatedTranslation
                    : translation,
            ) as Components.Schemas.GetHelpCenterDto['translations']

            dispatch(helpCenterUpdated({ ...helpCenter, translations }))
        }
    }

    const handleOnSave = async () => {
        try {
            await handleSaveHyperlink()
            await handleSaveLinks()
            await handleSaveExtraHTML()

            setIsDirty(false)

            void dispatch(
                notify({
                    message: 'Customizations saved with success',
                    status: NotificationStatus.Success,
                }),
            )
        } catch (err) {
            // ?   These messages are not really meaningful because if one request fails,
            // ? we are saying we failed to save them.
            void dispatch(
                notify({
                    message: 'Failed to save the customizations',
                    status: NotificationStatus.Error,
                }),
            )

            reportError(err as Error)
        }
    }

    const handleOnChangeLogoHyperlink = (nextValue: string) => {
        if (nextValue !== '' && !isURL(nextValue, isURLOptions)) {
            setLogoHyperlinkErrMessage('URL is invalid')
        } else if (nextValue === '' || isURL(nextValue, isURLOptions)) {
            setLogoHyperlinkErrMessage('')
        }
        setIsDirty(true)
        setLogoHyperlink(nextValue)
    }

    const isLogoHyperlinkUpdated = useMemo(() => {
        return logoHyperlink !== (translation?.logo_hyperlink || '')
    }, [logoHyperlink, translation])

    const isCustomHeaderToggled = useMemo(() => {
        if (!extraHTML) {
            return false
        }

        return !extraHTML?.custom_header_deactivated
    }, [extraHTML])

    const isCustomFooterToggled = useMemo(() => {
        if (!extraHTML) {
            return false
        }

        return !extraHTML?.custom_footer_deactivated
    }, [extraHTML])

    const isExtraHtmlToggled = useMemo(() => {
        if (!extraHTML) {
            return false
        }

        return !extraHTML?.extra_head_deactivated
    }, [extraHTML])

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            className={css.wrapper}
            isDirty={isDirty}
            onSaveChanges={handleOnSave}
            showLanguageSelector
        >
            <section>
                <div className={css.heading}>
                    <h3>Header settings</h3>
                    <p>
                        Change navigation elements at the top of the help
                        center.
                    </p>
                </div>
                {isHelpCenterLogoHyperlinkEnabled && (
                    <div className={css.inputField}>
                        <InputField
                            type="text"
                            name="logoHyperlink"
                            label="Logo hyperlink"
                            caption="Redirect your logo to a custom URL."
                            error={logoHyperlinkErrMessage}
                            value={logoHyperlink}
                            isDisabled={isCustomHeaderToggled}
                            onChange={handleOnChangeLogoHyperlink}
                        />
                    </div>
                )}
                <div className={css.toggleSection}>
                    <ToggleInput
                        isToggled={isCustomHeaderToggled}
                        onClick={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header_deactivated: !value,
                                    },
                            )
                        }}
                        className={css.toggle}
                    >
                        <div className={css.toggleLabel}>
                            <span>Use custom header</span>
                            <i
                                id="custom-header-toggle-info"
                                className={classNames(
                                    'material-icons',
                                    css.tooltipIcon,
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                target="custom-header-toggle-info"
                                placement="top-start"
                                innerProps={{
                                    innerClassName: css['tooltip-inner'],
                                    popperClassName: css.tooltip,
                                }}
                                arrowClassName={css['tooltip-arrow']}
                            >
                                Add custom HTML code for the Help Center header.
                            </Tooltip>
                        </div>
                    </ToggleInput>
                </div>
                {!isCustomHeaderToggled ? (
                    <>
                        <h5>Navigation Links</h5>
                        <LinkList
                            name="header"
                            titlePlaceholder="Link title"
                            urlPlaceholder="Link URL"
                            list={headerNavigation.links.map((item) => ({
                                id: item.id,
                                key: item.key,
                                value: item.value,
                                label: item.label,
                            }))}
                            onChange={(ev, key, id) => {
                                setIsDirty(true)
                                headerNavigation.update(
                                    ev.target.value,
                                    id,
                                    key,
                                )
                            }}
                            onDelete={(id) => {
                                setIsDirty(true)
                                headerNavigation.remove(id)
                            }}
                            onAddNew={() => {
                                setIsDirty(true)
                                headerNavigation.add(selectedLocale)
                            }}
                        />
                    </>
                ) : (
                    <CodeEditor
                        value={extraHTML?.custom_header}
                        onChange={(value) => {
                            setIsDirty(value !== extraHTML?.custom_header)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header: value,
                                    },
                            )
                        }}
                        mode="html"
                        highlightActiveLine={true}
                        width="auto"
                        height="200px"
                    />
                )}
            </section>
            <section>
                <div className={css.heading}>
                    <h3>Footer settings</h3>
                    <p>
                        Change navigation elements at the bottom of the help
                        center.
                    </p>
                </div>
                <div>
                    <ToggleInput
                        isToggled={isCustomFooterToggled}
                        onClick={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_footer_deactivated: !value,
                                    },
                            )
                        }}
                        className={css.toggle}
                    >
                        <div className={css.toggleLabel}>
                            <span>Use custom footer</span>
                            <i
                                id="custom-footer-toggle-info"
                                className={classNames(
                                    'material-icons',
                                    css.tooltipIcon,
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                target="custom-footer-toggle-info"
                                placement="top-start"
                                innerProps={{
                                    popperClassName: css.tooltip,
                                    innerClassName: css['tooltip-inner'],
                                }}
                                arrowClassName={css['tooltip-arrow']}
                            >
                                Add custom HTML code for the Help Center footer.
                            </Tooltip>
                        </div>
                    </ToggleInput>
                </div>
                <div className={css.toggleSection}>
                    <UpdateToggle
                        activated={
                            helpCenter.powered_by_deactivated_datetime === null
                        }
                        label="Powered by Gorgias"
                        description="Use this toggle to display or hide the Gorgias branding on the footer in Help Center."
                        fieldName="powered_by_deactivated"
                    />
                </div>
                {!isCustomFooterToggled ? (
                    <>
                        <div className={css.subsection}>
                            <h5>Navigation Links</h5>
                            <LinkList
                                name="footer"
                                titlePlaceholder="Link title"
                                urlPlaceholder="Link URL"
                                list={footerNavigation.links.map((item) => ({
                                    id: item.id,
                                    key: item.key,
                                    value: item.value,
                                    label: item.label,
                                }))}
                                onChange={(ev, key, id) => {
                                    setIsDirty(true)
                                    footerNavigation.update(
                                        ev.target.value,
                                        id,
                                        key,
                                    )
                                }}
                                onDelete={(id) => {
                                    setIsDirty(true)
                                    footerNavigation.remove(id)
                                }}
                                onAddNew={() => {
                                    setIsDirty(true)
                                    footerNavigation.add(selectedLocale)
                                }}
                            />
                        </div>
                        <SocialNavigationLinks
                            links={socialNavigation.links}
                            locale={selectedLocale}
                            onBlurLink={(ev, key, id) => {
                                setIsDirty(true)
                                socialNavigation.update(
                                    ev.target.value,
                                    id,
                                    key,
                                )
                            }}
                        />
                    </>
                ) : (
                    <CodeEditor
                        value={extraHTML?.custom_footer}
                        onChange={(value) => {
                            setIsDirty(value !== extraHTML?.custom_footer)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_footer: value,
                                    },
                            )
                        }}
                        mode="html"
                        highlightActiveLine={true}
                        width="auto"
                        height="200px"
                    />
                )}
            </section>
            <ExtraHtmlSection
                extraHTML={extraHTML}
                isExtraHtmlToggled={isExtraHtmlToggled}
                setIsDirty={setIsDirty}
                setExtraHTML={setExtraHTML}
            />
            <FormGroup>
                <Button
                    className="mr-2"
                    isDisabled={
                        !headerNavigation.isListValid() ||
                        !footerNavigation.isListValid() ||
                        !socialNavigation.isListValid() ||
                        !isDirty
                    }
                    onClick={handleOnSave}
                >
                    Save Changes
                </Button>
                <Button intent="secondary" onClick={handleOnReset}>
                    Cancel
                </Button>
            </FormGroup>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterCustomizationView
