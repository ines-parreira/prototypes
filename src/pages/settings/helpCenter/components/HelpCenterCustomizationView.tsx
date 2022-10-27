import React, {useEffect, useMemo, useState} from 'react'
import {FormGroup} from 'reactstrap'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    ExtraHTMLDto,
    LocalSocialNavigationLink,
    NavigationLink,
} from 'models/helpCenter/types'
import {getViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {HELP_CENTER_DEFAULT_LOCALE, SOCIAL_NAVIGATION_LINKS} from '../constants'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {
    useNavigationLinks,
    useSocialNavigationLinks,
} from '../hooks/useNavigationLinks'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {saveNavigationLinks, saveSocialLinks} from '../utils/navigationLinks'
import CodeEditor from '../../../common/components/CodeEditor/CodeEditor'
import ToggleInput from '../../../common/forms/ToggleInput'
import Tooltip from '../../../common/components/Tooltip'

import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {LinkList} from './LinkList'
import css from './HelpCenterCustomizationView.less'
import {LanguageSelect} from './LanguageSelect'
import CloseTabModal from './CloseTabModal'

export const HelpCenterCustomizationView = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {client} = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()
    const selectedLocale =
        useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [links, setLinks] = useState<NavigationLink[]>([])
    const [extraHTML, setExtraHTML] = useState<ExtraHTMLDto | null>(null)
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

    const linksWithoutSocial = useMemo(
        () =>
            links.filter((link) =>
                link.meta?.network
                    ? !Object.keys(SOCIAL_NAVIGATION_LINKS).includes(
                          link.meta?.network
                      )
                    : true
            ),
        [links]
    )

    const socialLinks = useMemo(
        () =>
            Object.entries(
                SOCIAL_NAVIGATION_LINKS
            ).map<LocalSocialNavigationLink>(([socialKey, socialLink]) => {
                const currentRemoteLink = links.find((link) =>
                    link.meta?.network
                        ? socialKey === link.meta.network.toLowerCase()
                        : false
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
        [links]
    )

    const headerNavigation = useNavigationLinks('header', linksWithoutSocial)
    const footerNavigation = useNavigationLinks('footer', linksWithoutSocial)
    const socialNavigation = useSocialNavigationLinks(socialLinks, {
        allowEmpty: true,
    })

    const handleOnReset = () => {
        headerNavigation.resetFields()
        footerNavigation.resetFields()
        setIsDirty(false)
    }
    const handleSaveLinks = async () => {
        if (client) {
            await saveNavigationLinks(
                client,
                linksWithoutSocial,
                headerNavigation.links.filter(
                    (link) => link.label && link.value
                ),
                {
                    group: 'header',
                    helpCenterId: helpCenterId,
                    locale: selectedLocale,
                }
            )

            await saveNavigationLinks(
                client,
                linksWithoutSocial,
                footerNavigation.links.filter(
                    (link) => link.label && link.value
                ),
                {
                    group: 'footer',
                    helpCenterId: helpCenterId,
                    locale: selectedLocale,
                }
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
                extraHTML
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

    const handleOnSave = async () => {
        try {
            await handleSaveLinks()
            await handleSaveExtraHTML()

            setIsDirty(false)

            void dispatch(
                notify({
                    message: 'Customizations saved with success',
                    status: NotificationStatus.Success,
                })
            )
        } catch (err) {
            // ?   These messages are not really meaningful because if one request fails,
            // ? we are saying we failed to save them.
            void dispatch(
                notify({
                    message: 'Failed to save the customizations',
                    status: NotificationStatus.Error,
                })
            )

            console.error(err)
        }
    }

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
        <HelpCenterPageWrapper helpCenter={helpCenter} className={css.wrapper}>
            <section>
                <div className={css.heading}>
                    <div>
                        <div className={css.headingInner}>
                            <h3>Customization</h3>
                            <LanguageSelect />
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div className={css.heading}>
                    <h4>Header settings</h4>
                    <p>
                        Change navigation elements at the top of the help
                        center.
                    </p>
                </div>
                <div>
                    <ToggleInput
                        isToggled={isCustomHeaderToggled}
                        onClick={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header_deactivated: !value,
                                    }
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
                                    css.tooltipIcon
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                target="custom-header-toggle-info"
                                placement="top-start"
                                popperClassName={css.tooltip}
                                innerClassName={css['tooltip-inner']}
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
                                    key
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
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header: value,
                                    }
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
                    <div>
                        <h4>Footer settings</h4>
                        <p>
                            Change navigation elements at the bottom of the help
                            center.
                        </p>
                    </div>
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
                                    }
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
                                    css.tooltipIcon
                                )}
                            >
                                info_outline
                            </i>
                            <Tooltip
                                target="custom-footer-toggle-info"
                                placement="top-start"
                                popperClassName={css.tooltip}
                                innerClassName={css['tooltip-inner']}
                                arrowClassName={css['tooltip-arrow']}
                            >
                                Add custom HTML code for the Help Center footer.
                            </Tooltip>
                        </div>
                    </ToggleInput>
                </div>
                {!isCustomFooterToggled ? (
                    <>
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
                                    key
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
                        <SocialNavigationLinks
                            links={socialNavigation.links}
                            locale={selectedLocale}
                            onBlurLink={(ev, key, id) => {
                                setIsDirty(true)
                                socialNavigation.update(
                                    ev.target.value,
                                    id,
                                    key
                                )
                            }}
                        />
                    </>
                ) : (
                    <CodeEditor
                        value={extraHTML?.custom_footer}
                        onChange={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_footer: value,
                                    }
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
                    <h4>Extra HTML</h4>
                    <p>
                        Add extra HTML in the{' '}
                        <a
                            href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML"
                            rel="noreferrer"
                            target="_blank"
                        >
                            head section
                        </a>
                        .
                    </p>
                </div>
                <div>
                    <ToggleInput
                        isToggled={isExtraHtmlToggled}
                        onClick={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        extra_head_deactivated: !value,
                                    }
                            )
                        }}
                        className={css.toggle}
                    >
                        Add extra HTML
                    </ToggleInput>
                </div>
                {isExtraHtmlToggled && (
                    <CodeEditor
                        value={extraHTML?.extra_head}
                        onChange={(value) => {
                            setIsDirty(true)
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        extra_head: value,
                                    }
                            )
                        }}
                        mode="html"
                        highlightActiveLine={true}
                        width="auto"
                        height="200px"
                    />
                )}
            </section>
            <FormGroup>
                <Button
                    className="mr-2"
                    isDisabled={
                        !headerNavigation.isListValid() ||
                        !footerNavigation.isListValid() ||
                        !socialNavigation.isListValid()
                    }
                    onClick={handleOnSave}
                >
                    Save Changes
                </Button>
                <Button intent="secondary" onClick={handleOnReset}>
                    Cancel
                </Button>
            </FormGroup>
            <CloseTabModal when={isDirty} onSave={handleOnSave} />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterCustomizationView
