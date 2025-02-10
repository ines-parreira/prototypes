import {AiAgentStoreConfigurationFixture} from '../../tests/AiAgentStoreConfiguration.fixture'
import {HelpCenterDataFixture} from '../../tests/HelpCenterData.fixture'
import {ConnectAHelpCenterTask} from '../ConnectAHelpCenter.task'

describe('ConnectAHelpCenter', () => {
    it('should display the task if no help center is connected and at least 1 helpcenter exists', () => {
        const faqHelpCenters = HelpCenterDataFixture.start()
            .withFaqHelpCenter()
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withoutConnectedHelpCenter()
                .build()

        const task = new ConnectAHelpCenterTask(
            {
                faqHelpCenters,
                aiAgentStoreConfiguration,
                fileIngestion: [],
            },
            {
                aiAgentRoutes: {} as any,
            }
        )
        expect(task.display).toBe(true)
    })

    it('should not display the task if a help center is connected', () => {
        const faqHelpCenters = HelpCenterDataFixture.start()
            .withFaqHelpCenter()
            .build()

        const aiAgentStoreConfiguration =
            AiAgentStoreConfigurationFixture.start()
                .withConnectedHelpCenter(faqHelpCenters[0].id)
                .build()

        const task = new ConnectAHelpCenterTask(
            {
                aiAgentStoreConfiguration,
                faqHelpCenters,
                fileIngestion: [],
            },
            {
                aiAgentRoutes: {} as any,
            }
        )
        expect(task.display).toBe(false)
    })
})
