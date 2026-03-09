import type { ComponentProps } from 'react'
import React from 'react'

import { history } from '@repo/routing'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild'

import { ThemeProvider } from 'core/theme'

import { KnowledgeEditorHelpCenterArticleReadView } from './KnowledgeEditorHelpCenterArticleReadView'

const meta: Meta<typeof KnowledgeEditorHelpCenterArticleReadView> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorHelpCenterArticleReadView',
    component: KnowledgeEditorHelpCenterArticleReadView,
    argTypes: {},
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorHelpCenterArticleReadView>

const Template: StoryFn<
    ComponentProps<typeof KnowledgeEditorHelpCenterArticleReadView>
> = (args) => (
    <ThemeProvider>
        <Provider
            store={configureMockStore()({
                ui: { editor: { isFocused: false } },
            })}
        >
            <Router history={history}>
                <KnowledgeEditorHelpCenterArticleReadView {...args} />
            </Router>
        </Provider>
    </ThemeProvider>
)

const content = `<div>
<article id="isPasted"><div><p>SNOO is the latest invention from Dr Harvey Karp, creator of the celebrated book/video, <em>The Happiest Baby on the Block</em>. Designed in collaboration with MIT-trained engineers and the acclaimed industrial designer Yves B&eacute;har, SNOO boosts sleep for babies 0-6 months with the soothing rhythms they enjoyed in the womb. SNOO comes with 3 organic cotton wraps (S, M, L). These patented &#39;5-second swaddles&#39; keep babies on their backs!</p><p>When a baby fusses, SNOO &lsquo;hears&rsquo; the crying and chooses just the right amount of shushing sound and jiggly motion to help lull the baby back to sleep. SNOO&rsquo;s simple-to-use App lets parents modify the experience to select the most responses that work the best for their baby.</p><p><iframe src="https://www.youtube.com/embed/JyU-hKuFHZQ" width="560" height="315" frameborder="0" allowfullscreen=""></iframe></p><p>If you&#39;re seeking personalized sleep support for your little one, we invite you to try our <a href="https://zingtree.com/show/201871771" style=" text-decoration: none;">Sleep Questionnaire</a>, and our dedicated Sleep Consultants are here to help.</p></div></article><p>Disclaimer: The information on our site is NOT medical advice for any specific person or condition. It is only meant as general information. If you have any medical questions and concerns about your child or yourself, please contact your health provider.</p>

<p id="isPasted"><em>Please make sure you have the latest version of the App. The latest is always available from the <a href="https://apps.apple.com/us/app/happiest-baby/id1562132169" target="_blank" rel="noopener noreferrer" style=" text-decoration: none;">Apple&reg; App Store</a> or <a href="https://play.google.com/store/apps/details?id=com.happiestbaby.hbi" target="_blank" rel="noopener noreferrer" style=" text-decoration: none;">Google Play&reg;</a>.&nbsp;</em></p><p>Glad you asked! Please follow the instructions below:</p><h3><span style="font-size: 16px;">1. Creating your Happiest Baby Account</span></h3><p>After downloading the Happiest Baby App, click <strong><em>Sign Up</em></strong> and follow the on-screen prompts to enter your information. <em>Important:</em> The email address you enter will be your account username. Please be sure to create your Happiest Baby account with an email address you have access to, as you&rsquo;ll need to verify your account by entering the verification code you receive via email.&nbsp;</p><p>You can connect multiple devices (phones, etc.) to the same SNOO, but you must use the same login credentials as was used by the device that is paired to SNOO, or share credentials via our <a href="https://www.happiestbaby.eu/help-center?hcUrl=%252Fen-GB%252Fcan-snoo-or-snoobie-sync-with-multiple-mobile-devices-1424237" style=" text-decoration: none;" target="_blank" rel="noopener noreferrer"><span style=" text-decoration: underline;">Share Account</span></a> feature.</p><p>Once you decide on the account you&#39;ll use...always use that same login for that particular SNOO!</p><p><img alt="How do I set up my account and baby’s profile in the Happiest Baby App? Sign Up .PNG" height="433" src="https://attachments.gorgias.help/PG09N6gdzaw24j5g/hc/bgJ1Q6QNXY2vXKOM/2025090914-78fcaa65-7279-4ca1-ad1b-13b162d3f260-1.png" width="200" class="fr-fic fr-dii"></p><h3><br></h3><h3><span style="font-size: 16px;">2. Setting up your Baby&rsquo;s Profile</span></h3><p>After completing the initial signup process, which will guide you through creating a baby profile, you can create additional baby profiles (great for parents of twins and multiples!):</p><ul><li>Tap on the Baby Selector (top right-hand corner of the screen)</li><li>Tap Add Baby Profile</li><li>Enter your baby&rsquo;s info on the Create Baby Profile screen</li><li>Tap Create Profile</li></ul><p><em>Please Note:</em> If your baby hasn&rsquo;t arrived yet...you can enter their expected due date for now&hellip; You can update your baby&rsquo;s information at any time. Head to the <strong><em>Profile</em></strong> icon at the bottom of your screen, then to your baby&rsquo;s <strong><em>Edit Profile</em></strong> screen. Enter your baby&rsquo;s name, birthdate, and gender.&nbsp;</p><p>You can also set the Baby&rsquo;s <strong><em>Day Start</em></strong> (the time your baby&rsquo;s day begins), an important setting to track your baby&rsquo;s routine. For this and more customizations, head to the <strong><em>Profile</em></strong> icon in the bottom right corner of the screen and select <strong><em>App Settings</em></strong>.</p><p><img alt="How do I set up my account and baby’s profile in the Happiest Baby App? Sign Up 2.PNG" height="433" src="https://attachments.gorgias.help/PG09N6gdzaw24j5g/hc/bgJ1Q6QNXY2vXKOM/2025090914-de763e45-3ce3-41b1-990a-e6d07f431a74-2.png" width="200" class="fr-fic fr-dii"></p><p><span style="color: #374151;"><em>*Certain features and access are exclusive to the Premium Subscription of the App.</em></span></p><article id="isPasted"><div itemprop="articleBody"><p><br></p></div></article><p><strong>Disclaimer:</strong> <em>The information on our site is NOT medical advice for any specific person or condition. It is only meant as general information. If you have any medical questions and concerns about your child or yourself, please contact your health provider.&nbsp;</em></p>
</div>`

export const ReadView: Story = Template.bind({})
ReadView.args = {
    content,
    title: 'What is SNOO? (Video Tutorial)',
}
