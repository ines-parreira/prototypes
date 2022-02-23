import React, {useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {FormGroup} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

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

export const HelpCenterCustomizationView = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const {isReady, client} = useHelpCenterApi()
    const helpCenter = useCurrentHelpCenter()
    const selectedLocale =
        useSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const [links, setLinks] = useState<NavigationLink[]>([])
    const [extraHTML, setExtraHTML] = useState<ExtraHTMLDto | null>(null)

    useEffect(() => {
        async function init() {
            if (isReady && client && selectedLocale) {
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
    }, [isReady, helpCenterId, selectedLocale, client])

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
                        onClick={(value) =>
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header_deactivated: !value,
                                    }
                            )
                        }
                        className={css.toggle}
                    >
                        <>
                            <span>Use custom header</span>
                            <span>
                                <span
                                    className={css.toggleTooltip}
                                    id="custom-header-toggle-info"
                                >
                                    <i className="material-icons">
                                        info_outline
                                    </i>
                                </span>
                                <Tooltip
                                    target="custom-header-toggle-info"
                                    placement="top"
                                >
                                    Add custom HTML code for the help center
                                    header.
                                </Tooltip>
                            </span>
                        </>
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
                                headerNavigation.update(
                                    ev.target.value,
                                    id,
                                    key
                                )
                            }}
                            onDelete={headerNavigation.remove}
                            onAddNew={() =>
                                headerNavigation.add(selectedLocale)
                            }
                        />
                    </>
                ) : (
                    <CodeEditor
                        value={extraHTML?.custom_header}
                        onChange={(value) =>
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_header: value,
                                    }
                            )
                        }
                        mode="html"
                        fontSize={14}
                        showGutter={true}
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
                        onClick={(value) =>
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_footer_deactivated: !value,
                                    }
                            )
                        }
                        className={css.toggle}
                    >
                        <>
                            <span>Use custom footer</span>
                            <span>
                                <span
                                    className={css.toggleTooltip}
                                    id="custom-footer-toggle-info"
                                >
                                    <i className="material-icons">
                                        info_outline
                                    </i>
                                </span>
                                <Tooltip
                                    target="custom-footer-toggle-info"
                                    placement="top"
                                >
                                    Add custom HTML code for the help center
                                    footer.
                                </Tooltip>
                            </span>
                        </>
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
                                footerNavigation.update(
                                    ev.target.value,
                                    id,
                                    key
                                )
                            }}
                            onDelete={footerNavigation.remove}
                            onAddNew={() =>
                                footerNavigation.add(selectedLocale)
                            }
                        />
                        <SocialNavigationLinks
                            links={socialNavigation.links}
                            locale={selectedLocale}
                            onBlurLink={(ev, key, id) => {
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
                        onChange={(value) =>
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        custom_footer: value,
                                    }
                            )
                        }
                        mode="html"
                        fontSize={14}
                        showGutter={true}
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
                        onClick={(value) =>
                            setExtraHTML(
                                (extraHTML) =>
                                    extraHTML && {
                                        ...extraHTML,
                                        extra_head_deactivated: !value,
                                    }
                            )
                        }
                        className={css.toggle}
                    >
                        Add extra HTML
                    </ToggleInput>
                </div>
                <CodeEditor
                    value={extraHTML?.extra_head}
                    disabled={!isExtraHtmlToggled}
                    onChange={(value) =>
                        setExtraHTML(
                            (extraHTML) =>
                                extraHTML && {
                                    ...extraHTML,
                                    extra_head: value,
                                }
                        )
                    }
                    mode="html"
                    fontSize={14}
                    showGutter={true}
                    highlightActiveLine={true}
                    width="auto"
                    height="200px"
                />
            </section>
            <FormGroup>
                <Button
                    className="mr-2"
                    isDisabled={
                        !headerNavigation.isListValid() ||
                        !footerNavigation.isListValid() ||
                        !socialNavigation.isListValid()
                    }
                    intent={ButtonIntent.Primary}
                    type="button"
                    onClick={handleOnSave}
                >
                    Save Changes
                </Button>
                <Button
                    intent={ButtonIntent.Secondary}
                    type="button"
                    onClick={handleOnReset}
                >
                    Cancel
                </Button>
            </FormGroup>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterCustomizationView
