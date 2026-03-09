import type { Meta, StoryFn } from 'storybook-react-rsbuild'

const storyConfig: Meta = {
    title: 'Analytics UI Kit/Color Palette',
    parameters: {
        chromatic: {
            disableSnapshot: false,
        },
    },
}

const colors = [
    { name: 'Blue', value: '--analytics-blue' },
    { name: 'Yellow', value: '--analytics-yellow' },
    { name: 'Magenta', value: '--analytics-magenta' },
    { name: 'Brown', value: '--analytics-brown' },
    { name: 'Dark Blue', value: '--analytics-dark-blue' },
    { name: 'Dark Brown', value: '--analytics-dark-brown' },
    { name: 'Grey', value: '--analytics-grey' },
    { name: 'Turquoise', value: '--analytics-turquoise' },
    { name: 'Indigo', value: '--analytics-indigo' },
    { name: 'Pink', value: '--analytics-pink' },
    { name: 'Heatmap 0', value: '--analytics-heatmap-0' },
    { name: 'Heatmap 1', value: '--analytics-heatmap-1' },
    { name: 'Heatmap 2', value: '--analytics-heatmap-2' },
    { name: 'Heatmap 3', value: '--analytics-heatmap-3' },
    { name: 'Heatmap 4', value: '--analytics-heatmap-4' },
    { name: 'Heatmap 5', value: '--analytics-heatmap-5' },
    { name: 'Heatmap 6', value: '--analytics-heatmap-6' },
    { name: 'Heatmap 7', value: '--analytics-heatmap-7' },
    { name: 'Heatmap 8', value: '--analytics-heatmap-8' },
    { name: 'Heatmap 9', value: '--analytics-heatmap-9' },
]

const themes = ['modern', 'light', 'dark']

const Template: StoryFn = () => (
    <>
        {themes.map((theme) => (
            <div className={theme} key={theme}>
                <h1>Theme: {theme}</h1>
                {colors.map(({ name, value }) => (
                    <div key={value}>
                        <div
                            style={{
                                width: '30px',
                                height: '15px',
                                backgroundColor: `var(${value})`,
                            }}
                        ></div>
                        <div>{name}</div>
                    </div>
                ))}
            </div>
        ))}
    </>
)

export const Default = Template.bind({})

export default storyConfig
