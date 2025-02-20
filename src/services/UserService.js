import { EntryExistsError } from "#errors/EntryExists.js";
import { prisma } from "../PrismaClient.js";

const PRISMA_ERRORS = {
    alreadyExists: "P2002",
};

const SELECTION_SET = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};

async function add(data) {
    let user;
    try {
        user = await prisma.user.create({
            data,
            select: SELECTION_SET,
        });
    } catch (error) {
        if (error.code == PRISMA_ERRORS.alreadyExists) {
            throw new EntryExistsError();
        } else {
            throw error;
        }
    }

    return user;
}

async function read(id) {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    return user;
}

async function update(id, data) {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data,
        select: SELECTION_SET,
    });

    return user;
}

async function del(id) {
    const user = await prisma.user.delete({
        where: {
            id,
        },
        select: SELECTION_SET,
    });

    return user;
}

async function getAuthData(email) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            password: true,
            status: true,
            role: true,
            name: true,
        },
    });

    return user;
}

export default { add, read, update, del, getAuthData };
