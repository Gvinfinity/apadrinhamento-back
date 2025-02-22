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

async function getStats() {
    const vets = await prisma.user.count({
        where: {
            role: 'veterane',
            status: true,
        },
    });

    const bixes = await prisma.user.count({
        where: {
            role: 'bixe',
            status: true,
        },
    });

    const pending = await prisma.user.count({
        where: {
            status: false,
        },
    });

    const approved = await prisma.user.count({
        where: {
            approved: true,
            role: 'veterane',
        },
    });

    return { vets, bixes, approved, pending };
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

async function getToMatch() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            course: true,
            pronouns: true,
            ethnicity: true,
            lgbt: true,
            city: true,
            hobby: true,
            role: true,
            parties: true,
            music: true,
            games: true,
            sports: true,
        },
        where: {
            status: true,
            role: { in: ['veterane', 'bixe'] },
        }
    });

    const adminUsers = await prisma.user.findMany({
        select: {
            id: true,
            course: true,
            pronouns: true,
            ethnicity: true,
            lgbt: true,
            city: true,
            hobby: true,
            role: true,
            parties: true,
            music: true,
            games: true,
            sports: true,
        },
        where: {
            status: true,
            role: 'ADMIN',
        }
    });

    for (const user of adminUsers) {
        user.role = 'veterane';
        users.push(user);
    }

    return users;
}

async function getPendingApproval() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            course: true,
            picture: true,
        },
        where: {
            approved: false,
            role: 'veterane',
        }
    });

    return users;
}

async function approve(id) {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            approved: true,
        },
    });

    return user;
}

async function addGodparentRelations(data) {
    const toAdd = [];
    
    for (const godchild of Object.keys(data)) {
        for (const godparent of data[godchild]) {
            toAdd.push({
                godchildId: godchild,
                godparentId: godparent,
            });
        }
    }

    const relations = await prisma.godparentRelation.createMany({
        data: toAdd,
    });

    return relations;
}

export default { add, read, update, del, getAuthData, getToMatch, getPendingApproval, approve, getStats, addGodparentRelations };
