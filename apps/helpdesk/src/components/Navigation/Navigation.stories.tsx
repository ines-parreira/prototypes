import type { ComponentProps } from 'react'

import { BrowserRouter, Link } from 'react-router-dom'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { DisplayType } from './components/NavigationSectionItem'
import { Navigation } from './Navigation'

const storyConfig: Meta = {
    title: 'General/Navigation Section',
    component: Navigation.Root,
    argTypes: {},
}

const Template: StoryFn<ComponentProps<typeof Navigation.Root>> = () => {
    return (
        <BrowserRouter>
            <div style={{ maxWidth: '750px', width: '100%' }}>
                <Navigation.Root>
                    <Navigation.Section value="section-1">
                        <Navigation.SectionTrigger>
                            <div>Section 1</div>
                            <Navigation.SectionIndicator />
                        </Navigation.SectionTrigger>
                        <Navigation.SectionContent>
                            <Navigation.SectionItem as={Link} to="/">
                                Content 1
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                                as="button"
                                onClick={() => {}}
                            >
                                Content 2
                            </Navigation.SectionItem>
                            <Navigation.SectionItem>
                                Content 3
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                            >
                                Content 4
                            </Navigation.SectionItem>
                        </Navigation.SectionContent>
                    </Navigation.Section>
                    <Navigation.Section value="section-2">
                        <Navigation.SectionTrigger>
                            <div>Section 2</div>
                            <Navigation.SectionIndicator />
                        </Navigation.SectionTrigger>
                        <Navigation.SectionContent>
                            <Navigation.SectionItem>
                                Content 1
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                            >
                                Content 2
                            </Navigation.SectionItem>
                            <Navigation.SectionItem>
                                Content 3
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                            >
                                Content 4
                            </Navigation.SectionItem>
                        </Navigation.SectionContent>
                    </Navigation.Section>
                    <Navigation.Section value="section-3">
                        <Navigation.SectionTrigger>
                            <div>Section 3</div>
                            <Navigation.SectionIndicator />
                        </Navigation.SectionTrigger>
                        <Navigation.SectionContent>
                            <Navigation.SectionItem>
                                Content 1
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                            >
                                Content 2
                            </Navigation.SectionItem>
                            <Navigation.SectionItem>
                                Content 3
                            </Navigation.SectionItem>
                            <Navigation.SectionItem
                                displayType={DisplayType.Indent}
                            >
                                Content 4
                            </Navigation.SectionItem>
                        </Navigation.SectionContent>
                    </Navigation.Section>
                </Navigation.Root>
            </div>
        </BrowserRouter>
    )
}

const defaultProps: Partial<ComponentProps<typeof Navigation.Root>> = {}

export const DefaultNavigationSection = Template.bind({})
DefaultNavigationSection.args = { ...defaultProps }

export default storyConfig
