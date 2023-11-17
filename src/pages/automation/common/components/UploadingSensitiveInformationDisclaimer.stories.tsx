import {Meta} from '@storybook/react'

import UploadingSensitiveInformationDisclaimer from './UploadingSensitiveInformationDisclaimer'

const meta: Meta<typeof UploadingSensitiveInformationDisclaimer> = {
    title: 'Automation/UploadingSensitiveInformationDisclaimer',
    component: UploadingSensitiveInformationDisclaimer,
    /*parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: CHROMATIC_RESPONSIVE_VIEWPORTS,
    },
  },*/
}

export default meta

export const Default = {
    args: {},
    argTypes: {},
}
