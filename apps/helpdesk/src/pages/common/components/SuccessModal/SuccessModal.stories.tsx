import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import SuccessModal, { SuccessModalIcon } from './SuccessModal'

const storyConfig: Meta = {
    title: 'General/Modals/Success modal',
    component: SuccessModal,
}

const Template: StoryObj<typeof SuccessModal> = {
    render: function Template(props) {
        return <SuccessModal {...props} />
    },
}

export const Default = {
    ...Template,
    args: {
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
    },
}

export default storyConfig
