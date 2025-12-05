import { faker } from "@faker-js/faker"

export function dataUser() {
    const name = faker.person.fullName()
    const nameClean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const email = faker.internet.email({firstName: nameClean, provider: 'serverest.dev'})
    const password = faker.internet.password({ length: 12 })

    const data = {
        name: name,
        email: email,
        password: password
    }

    return data
}