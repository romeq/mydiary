```ts
const api = new Workspace()

const stories = [
    {
        date: "19.3.2023 15:00",
        identifier: "2ffa9ac8-62d4-491d-b7a9-d6cc797ee44d",
        story: `moi!`,
    },
    {
        date: "20.3.2023 15:00",
        identifier: "bfae9d5f-5fad-4ce2-9d77-2e2398a7cb14",
        story: `moi pt2!`,
    }
]
stories.map((day) => api.addNew(day))

api.find("My")
// => [
// =>     {
// =>         date: "20.1.2023 15:00",
// =>         description: "My dream came true: I got the job I wanted!",
// =>         identifier: "bfae9d5f-5fad-4ce2-9d77-2e2398a7cb14",
// =>     },
// =>     {
// =>         date: "19.3.2023 15:00",
// =>         description: "My best friend annoyed me",
// =>         identifier: "2ffa9ac8-62d4-491d-b7a9-d6cc797ee44d",
// =>     }
// => ]

api.getDay("bfae9d5f-5fad-4ce2-9d77-2e2398a7cb14")
// => new Stream()



```
