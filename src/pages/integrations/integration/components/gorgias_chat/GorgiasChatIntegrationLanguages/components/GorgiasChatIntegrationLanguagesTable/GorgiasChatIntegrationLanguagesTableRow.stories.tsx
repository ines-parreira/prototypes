import React from 'react'
import {Meta, Story} from '@storybook/react'
import {BrowserRouter} from 'react-router-dom'

import {Language} from 'constants/languages'

import {GorgiasChatIntegrationLanguagesTable} from './GorgiasChatIntegrationLanguagesTable'
import {
    GorgiasChatIntegrationLanguagesTableRow,
    GorgiasChatIntegrationLanguagesTableRowProps,
} from './GorgiasChatIntegrationLanguagesTableRow'

const storyConfig: Meta = {
    argTypes: {},
    component: GorgiasChatIntegrationLanguagesTableRow,
    decorators: [(story) => <BrowserRouter>{story()}</BrowserRouter>],
    title: 'Chat/LanguagesTableRow',
}

const Template: Story<GorgiasChatIntegrationLanguagesTableRowProps> = ({
    language,
    onClickDelete,
    onClickSetAsDefault,
}) => {
    return (
        <GorgiasChatIntegrationLanguagesTable>
            <GorgiasChatIntegrationLanguagesTableRow
                language={language}
                onClickSetAsDefault={onClickSetAsDefault}
                onClickDelete={onClickDelete}
            />
        </GorgiasChatIntegrationLanguagesTable>
    )
}

const defaultProps: Partial<GorgiasChatIntegrationLanguagesTableRowProps> = {
    language: {
        language: Language.EnglishUs,
        primary: true,
        label: 'English (US)',
        link: '/integrations/1/chat/languages/en-US',
        showActions: false,
    },
}

export const Default = Template.bind({})
Default.args = defaultProps

export const DefaultWithActions = Template.bind({})
DefaultWithActions.args = {
    language: {
        language: Language.EnglishUs,
        primary: true,
        label: 'English (US)',
        link: '/integrations/1/chat/languages/en-US',
        showActions: true,
    },
    onClickSetAsDefault: (lang) => {
        alert(`Set '${lang.language}' as default`)
    },
    onClickDelete: (lang) => {
        alert(`Delete '${lang.language}'`)
    },
}

export const NotDefaultWithActions = Template.bind({})
NotDefaultWithActions.args = {
    language: {
        language: Language.EnglishUs,
        primary: false,
        label: 'English (US)',
        link: '/integrations/1/chat/languages/en-US',
        showActions: true,
    },
    onClickSetAsDefault: (lang) => {
        alert(`Set '${lang.language}' as default`)
    },
    onClickDelete: (lang) => {
        alert(`Delete '${lang.language}'`)
    },
}

export default storyConfig
