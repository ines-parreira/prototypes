import { NavLink } from 'react-router-dom'

import { ActiveContent, Navbar } from 'common/navigation'
import { Navigation } from 'components/Navigation/Navigation'

import { ConvertNavbarViewV2 } from './ConvertNavbarViewV2'
import { useConvertNavbarSections } from './useConvertNavbarSections'

import css from './ConvertNavbarV2.less'

export const ConvertNavbarV2 = () => {
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

                <ConvertNavbarViewV2 />
            </Navigation.Root>
        </Navbar>
    )
}
