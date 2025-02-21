import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import aws from "aws-sdk";

import UserService from "#services/UserService.js";

import { EntryExistsError } from "#errors/EntryExists.js";

import generateFormattedError from "#utils/generateFormattedError.js";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function add(request, response) {
    const bodySchema = z.object({
        email: z.string().regex(/^[a-zA-Z][0-9]{6}@dac.unicamp.br$/),
        password: z.string().min(8).transform(async (val) => await bcrypt.hash(val, 10)),
    })

    let data;

    try {
        data = await bodySchema.parseAsync(request.body);
    } catch (error) {
        return response.status(400).json(generateFormattedError(error));
    }

    try {
        const user = await UserService.add(data);
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return response.set({ "Cache-Control": "no-store" })
            .cookie("access-token", "Bearer " + token, {
                httpOnly: true,
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "strict",
                secure: process.env.NODE_ENV === "production",
            }).status(201).json({...user, access_token: token, token_type: "Bearer"});
    } catch (error) {
        if (error instanceof EntryExistsError) {
            return response
                .status(400)
                .json({ error: { message: error.message, code: error } });
        } else {
            console.error("Internal Server Error: " + error);
            return response.sendStatus(500);
        }
    }
}

async function read(request, response) {
    const idSchema = z.string().uuid();

    let id;

    try {
        id = idSchema.parse(request.params.id);
    } catch (error) {
        return response.status(400).json(generateFormattedError(error));
    }

    const user = await UserService.read(id);

    if (user) {
        return response.json({ user });
    } else {
        return response.sendStatus(404);
    }
}

async function update(request, response) {
    const bodySchema = z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        course: z.enum(["CC", "EC"], { required_error: "Selecione seu curso" }),
        role: z.enum(["bixe", "veterane"], { required_error: "Selecione uma opção" }),
        pronouns: z.array(z.string()),
        ethnicity: z.array(z.string()),
        city: z.string().min(1, "Informe sua cidade").refine((city) => city != 'Cidade', { message: 'Informe sua cidade' }),
        approved: z.boolean().optional(),
        lgbt: z.array(z.string()),
        parties: z.number().min(0).max(10),
        hobby: z.string().optional(),
        music: z.string().optional(),
        games: z.string().optional(),
        sports: z.string().optional(),
        picture: z.string().optional(),
    });

    const idSchema = z.string().uuid();

    let data, id;

    try {
        data = await bodySchema.parseAsync(request.body);
        id = idSchema.parse(request.params.id);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return response.status(400).json(generateFormattedError(error));
        }
        console.error(error);
        return response.sendStatus(500);
    }

    try {

        // Image validation
        if (data.picture) {
            const preImg = data.picture.split('base64,').pop();
            const img = Buffer.from(preImg, 'base64');
            const fileType = await fileTypeFromBuffer(img);
    
            if (!fileType || !ACCEPTED_IMAGE_TYPES.includes(fileType.mime)) {
                return response.status(400).json({ error: { message: "Invalid image type", code: "invalid_image_type" } });
            }
    
            if (img.length > 5 * 1024 * 1024) {
                return response.status(400).json({ error: { message: "Image too large", code: "image_too_large" } });
            }
    
            const picUrl = await s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${id}.${fileType.ext}`,
                Body: img,
                ContentType: fileType.mime,
                ACL: 'public-read',
            }).promise();
    
            data.picture = picUrl.Location;
        }
    } catch (error) {
        console.error(error);
        return response.sendStatus(500);
    }

    data.status = true;

    try {
        const user = await UserService.update(id, data);
        return response.json(user);
    } catch (error) {
        return response.sendStatus(404);
    }
}

async function del(request, response) {
    const emailSchema = z.string().email();

    let email;

    try {
        email = emailSchema.parse(request.params.email);
    } catch (error) {
        return response.status(400).json(generateFormattedError(error));
    }

    try {
        await UserService.del(email);
        return response.sendStatus(204);
    } catch (error) {
        return response.sendStatus(404);
    }
}

async function getToMatch(_request, response) {
    const users = await UserService.getToMatch();

    return response.json(users);
}

async function getPendingApproval(_request, response) {
    const users = await UserService.getPendingApproval();

    return response.json(users);
}

async function approve(request, response) {
    const idSchema = z.string().uuid();

    let id;

    try {
        id = idSchema.parse(request.params.id);
    } catch (error) {
        return response.status(400).json(generateFormattedError(error));
    }

    try {
        const user = await UserService.approve(id);
        return response.json(user);
    } catch (error) {
        return response.sendStatus(404);
    }
}

export default { add, read, update, del, getToMatch, getPendingApproval, approve };
