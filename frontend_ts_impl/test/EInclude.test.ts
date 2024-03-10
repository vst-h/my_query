import { QWhere, createQuery } from "../src/Query"
import { assert, assertType, describe, expect, it } from 'vitest'
import { Post } from "./EntityMap"

it(() => {})

// describe("Include", () => {
//   const q = createQuery({})
//   it("include one layer", () => {
//     const qInclude = q.Post.includes(t => t.author.comment.tags)

//     assertType<QWhere<Post, ["author", "comment", "tags"]>>(qInclude)

//     // qInclude.selectFrist()
//   })

//   it("include with$", () => {
//     const qInclude = q.Post.includes(t => t.author.comment.with$(c => c.user).tags)

//     assertType<QWhere<Post, ["author", { comment: "user" }, "tags"]>>(qInclude)

//   })
// })

