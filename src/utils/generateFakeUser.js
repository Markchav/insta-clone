import {faker} from '@faker-js/faker'


const generateFakeUser = ()=> {
    return {
        id:faker.string.uuid(),
        username:faker.internet.userName(),
        avatar:faker.image.avatar()
    }
}

export const generateFakeUsers= (length)=> {
    const users = []

    Array.from({length:length}).forEach(()=> {
        users.push(generateFakeUser())
    })

    return users
}

