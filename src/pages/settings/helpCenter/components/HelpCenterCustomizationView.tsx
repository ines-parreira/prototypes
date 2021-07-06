import React from 'react'
import {useSelector} from 'react-redux'
import {Button, Container, FormGroup} from 'reactstrap'

import {LocaleCode, NavigationLink} from '../../../../models/helpCenter/types'

import PageHeader from '../../../common/components/PageHeader'
import {readHelpcenterById} from '../../../../state/entities/helpCenters/selectors'

import {
    HELP_CENTER_LANGUAGE_DEFAULT,
    SOCIAL_NAVIGATION_LINKS,
} from '../constants'
import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'

import {useNavigationLinks} from '../hooks/useNavigationLinks'
import {useLocaleSelectOptions} from '../hooks/useLocaleSelectOptions'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'

import {SocialNavigationLinks} from '../components/SocialNavigationLinks'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {NavSection} from './NavSection'
import {LinkEntity} from './LinkList'

export const HelpCenterCustomizationView = () => {
    const helpcenterId = useHelpCenterIdParam()

    const data = useSelector(readHelpcenterById(helpcenterId.toString()))
    const {isReady, client} = useHelpcenterApi()

    const [links, setLinks] = React.useState<NavigationLink[]>([])
    const [selectedLocale, setSelectedLocale] = React.useState<LocaleCode>(
        HELP_CENTER_LANGUAGE_DEFAULT
    )

    React.useEffect(() => {
        if (selectedLocale !== data?.default_locale && data?.default_locale) {
            setSelectedLocale(data?.default_locale)
        }
    }, [data?.default_locale, selectedLocale])

    React.useEffect(() => {
        async function init() {
            if (isReady && client && selectedLocale) {
                const navigationlinks = await client.listNavigationLinks({
                    help_center_id: helpcenterId,
                    locale: selectedLocale,
                })

                setLinks(navigationlinks.data.data)
            }
        }

        void init()
    }, [isReady, helpcenterId, selectedLocale, client])

    const linksWithoutSocial = React.useMemo(() => {
        return links.filter((link) => {
            if (link.translation) {
                return !SOCIAL_NAVIGATION_LINKS.includes(
                    link.translation.label.toLowerCase()
                )
            }
            return true
        })
    }, [links])

    const socialLinks = React.useMemo(() => {
        return links.filter((link) => {
            if (link.translation) {
                return SOCIAL_NAVIGATION_LINKS.includes(
                    link.translation.label.toLowerCase()
                )
            }
            return false
        })
    }, [links])

    const headerNavigation = useNavigationLinks('header', linksWithoutSocial)
    const footerNavigation = useNavigationLinks('footer', linksWithoutSocial)
    const socialNavigation = useNavigationLinks('footer', socialLinks, {
        allowEmpty: true,
    })

    // TODO: remove fixture
    const localesOptions = useLocaleSelectOptions(
        getLocalesResponseFixture,
        data?.supported_locales
    )

    const handleOnReset = () => {
        headerNavigation.resetFields()
        footerNavigation.resetFields()
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={data.name}
                        activeLabel="Customization"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpcenterId} />
            <Container
                fluid
                className="page-container"
                style={{paddingBottom: 24}}
            >
                <NavSection
                    availableLocales={localesOptions}
                    description="Change navigation elements at the top of the help center."
                    items={headerNavigation.links as LinkEntity[]}
                    name="header"
                    selectedLocale={selectedLocale}
                    title="Header settings"
                    onBlurLink={(ev, key, id) => {
                        headerNavigation.update(ev.target.value, id, key)
                    }}
                    onClickAdd={headerNavigation.add}
                    onChangeLocale={setSelectedLocale}
                    onClickRemove={headerNavigation.remove}
                />
                <NavSection
                    availableLocales={localesOptions}
                    description="Change navigation elements at the bottom of the help center."
                    items={footerNavigation.links as LinkEntity[]}
                    name="footer"
                    selectedLocale={selectedLocale}
                    title="Footer settings"
                    onBlurLink={(ev, key, id) => {
                        footerNavigation.update(ev.target.value, id, key)
                    }}
                    onClickAdd={footerNavigation.add}
                    onChangeLocale={setSelectedLocale}
                    onClickRemove={footerNavigation.remove}
                />
                <SocialNavigationLinks
                    links={socialNavigation.links as LinkEntity[]}
                    onBlurLink={(ev, key, id) => {
                        socialNavigation.update(ev.target.value, id, key)
                    }}
                />
                <FormGroup className="mt-5">
                    <Button
                        disabled={
                            !headerNavigation.isListValid() ||
                            !footerNavigation.isListValid() ||
                            !socialNavigation.isListValid()
                        }
                        className="mr-2"
                        color="success"
                    >
                        Save Changes
                    </Button>
                    <Button onClick={handleOnReset}>Cancel</Button>
                </FormGroup>
            </Container>
        </div>
    )
}

export default HelpCenterCustomizationView
