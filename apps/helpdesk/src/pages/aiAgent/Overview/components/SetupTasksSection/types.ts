export enum TasksCategory {
    Essential = 'Essential',
    Customize = 'Customize',
    Train = 'Train',
    Deploy = 'Deploy',
}

export type Task = {
    name: string
    isCompleted: boolean
    body: React.ReactNode
}

export type TasksConfigByCategory = {
    [key in TasksCategory]: Task[]
}
