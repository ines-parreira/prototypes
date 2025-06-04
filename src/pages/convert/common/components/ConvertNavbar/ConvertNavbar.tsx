import { NavLink } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'

import { ConvertNavbarView } from './ConvertNavbarView'
import { useConvertNavbarSections } from './useConvertNavbarSections'

import css from './ConvertNavbar.less'

export const ConvertNavbar = () => {
    const { sections, handleNavigationStateChange } = useConvertNavbarSections()

    return (
        <Navbar activeContent={ActiveContent.Convert} title="Convert">
            <Navigation.Root
                className={css.navigation}
                value={sections}
                onValueChange={handleNavigationStateChange}
            >
                <Navigation.SectionItem
                    as={NavLink}
                    to="/app/convert/overview"
                    exact
                >
                    Overview
                </Navigation.SectionItem>

                <ConvertNavbarView />
            </Navigation.Root>
        </Navbar>
    )
}
