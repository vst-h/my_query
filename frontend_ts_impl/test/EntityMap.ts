import { Id } from "../src/Id"

declare module "../src/Query" {
  interface EntityMap {
    User: User
    Post: Post
    Comment: Comment
    Tag: Tag
  }
}


export interface User {
  id: Id<User>
  name: string

  posts: Post[]
  comments: Comment[]
  tags: Tag[]
  badge: Badge[]
  // ["~include"]: {
  //   posts: Post[]
  //   comments: Comment[]
  //   tags: Tag[]
  // }
}

type PostSummary = Pick<Post, "id" | "content">
// const PostSummary =

export interface Post {
  id: Id<Post>
  author_id: Id<User>
  titel: string
  content: string
  create_at: Date
  update_at: Date
  delete_at?: Date
  is_archive: boolean
  click_count: number

  author: User
  comment: Comment[]
  tags: Tag[]

  // ["~include"]: {
  //   author: User
  //   comment: Comment[]
  //   tags: Tag[]
  // }
}

// export interface Post_Comment {
//   post_id: Id<Post>
//   comment_id: Id<Comment>
// }

export interface Comment {
  id: Id<Comment>
  user_id: Id<User>
  post_id: Id<Post>
  content: string
  create_at: Date
  delete_at: Date

  user: User
  // ["~include"]: {
  //   user: User
  // }
}

export interface Tag {
  id: Id<Tag>
  parent_id: Id<Tag>
  name: string

  // ["~include"]: {
  //   children: Tag[]
  // }
}

export interface Post_Tag {
  post_id: Id<Post>
  tag_id: Id<Tag>

  // ["~include"]: {
  //   tags: Tag[]
  // }
}

export interface User_Tag {
  user_id: Id<User>
  tag_id: Id<Tag>

  // ["~include"]: {
  //   tags: Tag[]
  // }
}

export interface Badge {
  id: Id<Badge>
  name: string
  icon: string
}
