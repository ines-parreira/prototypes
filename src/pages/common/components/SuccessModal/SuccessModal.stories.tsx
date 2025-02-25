import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import SuccessModal, { SuccessModalIcon } from './SuccessModal'

const storyConfig: Meta = {
    title: 'General/Modals/Success modal',
    component: SuccessModal,
}

const Template: Story<ComponentProps<typeof SuccessModal>> = (props) => (
    <SuccessModal {...props} />
)

export const Default = Template.bind({})
Default.args = {
    icon: SuccessModalIcon.PartyPopper,
    buttonLabel: 'Got it',
    children: (
        <>
            <div className="heading-page-semibold mb-2">All set!</div>
            <div className="heading-subsection-regular">
                Your chat is now available on your website.
            </div>
        </>
    ),
    isOpen: true,
}

export default storyConfig
