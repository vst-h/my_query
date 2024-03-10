declare const id: unique symbol

export type IsIId<T> = typeof id extends keyof T ? true : false
interface IId<T = _> {
    [id]?: T
}

export interface Id<T> extends Number, IId<T> { }
export interface SId<T> extends String, IId<T> { }
