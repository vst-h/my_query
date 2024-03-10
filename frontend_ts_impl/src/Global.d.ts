export { }

declare global {
  /** Union To Intersection */
  type U2I<T>
    = (T extends unknown ? ((a: T) => 0) : never) extends ((a: infer U) => 0)
    ? U // { [K in keyof U]: U[K] }
    : never


  type OrArray<T> = T | T[]

  // https://github.com/microsoft/TypeScript/issues/27575
  type NoFnProp = { [K in keyof Function]: never }

  namespace Arr {
    /**
    * @example
    type T1 = ArrayElement<number[]> // -> number
    */
    type Element<T> = T extends ArrayLike<infer E> ? E : T
  }

  namespace Tup {
    type Add<Tup, Elm> = Tup extends _[] ? [...Tup, Elm] : never
    type Last<Tup> = Tup extends [..._[], infer L] ? L : never
    type SetLast<Tup, Elm> = Tup extends [...infer Xs, _] ? [...Xs, Elm] : never
  }

  namespace Obj {

    type Key<T> = T extends _ ? keyof T : never

    type Prop<T, K>
      = K extends PropertyKey
      ? T extends { [_ in K]: infer V } ? V
      : never : never

    type PropKey<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
  }

  namespace Str {
    type Split<S, Sep extends string>
      = S extends `${infer S1}${Sep}${infer Rest}`
      ? [S1, ...Split<Rest, Sep>]
      : [S]

    type Trim<S, STrim extends string> = TrimStart<TrimEnd<S, STrim>, STrim>
    type TrimStart<S, STrim extends string> = S extends `${STrim}${infer Res}` ? Res : S
    type TrimEnd<S, STrim extends string> = S extends `${infer Res}${STrim}` ? Res : S
  }

  type _ = unknown

  interface Lazy<T> { "_": T }
}