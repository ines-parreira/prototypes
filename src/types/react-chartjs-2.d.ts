declare module 'react-chartjs-2' {
    import * as chartjs from 'chart.js'

    export interface Props
        extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
        id?: string
        className?: string
        height?: number
        width?: number
        redraw?: boolean
        type: chartjs.ChartType
        data:
            | {[key: string]: any}
            | chartjs.ChartData
            | ((canvas: HTMLCanvasElement) => chartjs.ChartData)
        options?: chartjs.ChartOptions
        fallbackContent?: React.ReactNode
        plugins?: chartjs.Plugin[]
        getDatasetAtEvent?: (
            dataset: Record<string, unknown>[],
            event: React.MouseEvent<HTMLCanvasElement>
        ) => void
        getElementAtEvent?: (
            element: unknown[],
            event: React.MouseEvent<HTMLCanvasElement>
        ) => void
        getElementsAtEvent?: (
            elements: Record<string, unknown>[],
            event: React.MouseEvent<HTMLCanvasElement>
        ) => void
    }
    export const Line: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Bar: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Radar: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Doughnut: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const PolarArea: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Bubble: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Pie: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const Scatter: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export const defaults: chartjs.Defaults
    export const Chart: typeof chartjs.Chart
    const ChartComponent: React.ForwardRefExoticComponent<
        Props & React.RefAttributes<any>
    >
    export default ChartComponent
}
