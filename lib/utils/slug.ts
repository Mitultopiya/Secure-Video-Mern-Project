import { customAlphabet } from "nanoid"

// Create a custom alphabet without confusing characters (0, O, l, 1, I)
const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ"
const nanoid = customAlphabet(alphabet, 10)

export function generateSlug(): string {
  return nanoid()
}
