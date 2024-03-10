
import { describe, test } from 'vitest'
import { Id, SId } from '../src/Id'
import { Post, User } from './EntityMap'

describe("Id", () => {
  function assignedIdNumber(id: Id<Post>) { }
  function assignedIdString(id: SId<Post>) { }

  describe("IId<number>", () => {
    test("number can be assigned", () => {
      assignedIdNumber(3)
    })

    test("has number method", () => {
      const id: Id<Post> = 3
      id.toFixed(2)
    })

    test("string connot assigned", () => {
      // @ts-expect-error
      assignedIdNumber("003")
    })

    test("IId<string> connot assigned", () => {
      const sid: SId<Post> = "003"
      // @ts-expect-error
      assignedIdNumber(sid)
    })

    test("Different entity Id cannot be assigned", () => {
      let postId: Id<Post> = 3
      let userId: Id<User> = 3

      // @ts-expect-error
      postId = userId

      // @ts-expect-error
      userId = postId
    })
  })

  describe("IId<string>", () => {

    test("string can be assigned", () => {
      assignedIdString("003")
    })

    test("has string method", () => {
      const id: SId<Post> = "003"
      id.toUpperCase()
    })

    test("number cannot assigned", () => {
      // @ts-expect-error
      assignedIdString(3)
    })

    test("IId<number> connot assigned", () => {
      const id: Id<Post> = 3
      // @ts-expect-error
      assignedIdString(id)
    })

    test("Different entity Id cannot be assigned", () => {
      let postId: SId<Post> = "003"
      let userId: SId<User> = "003"

      // @ts-expect-error
      postId = userId

      // @ts-expect-error
      userId = postId
    })
  })

})
{
  type A1 = ObjMarge<{ a: 1, b: 2 }, { a: 2 }>
  type ObjMarge<T, U> = {
    [K in Obj.Key<T | U>]: Obj.Prop<T | U, K>
  }
}