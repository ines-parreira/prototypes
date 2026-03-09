import classNames from 'classnames'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { FilterWarningIcon } from 'domains/reporting/pages/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import EditableTitle from 'pages/common/components/EditableTitle/EditableTitle'

const storyConfig: Meta = {
    component: EditableTitle,
    title: 'General/EditableTitles/EditableTitle',
}

const DefaultTemplate: StoryObj<typeof EditableTitle> = {
    render: function DefaultTemplate(props) {
        return <EditableTitle {...props} />
    },
}

const TemplateWithIcons: StoryObj<typeof EditableTitle> = {
    render: function TemplateWithIcons() {
        return (
            <EditableTitle
                title="Team 1 Filter"
                update={() => {}}
                prefix={
                    <i
                        className={classNames('material-icons', {
                            height: '18px',
                            width: '18px',
                        })}
                    >
                        tune
                    </i>
                }
                suffix={
                    <FilterWarningIcon
                        tooltip="Some filters are not applicable to this report and are disabled."
                        warningType="not-applicable"
                    />
                }
            />
        )
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        hasError: false,
        update: () => {},
        title: 'Team 1 Filter',
        forceEditMode: false,
    },
}

export const TitleWithIcons = {
    ...TemplateWithIcons,
    args: {
        hasError: false,
    },
}

export default storyConfig
