-- CreateEnum
CREATE TYPE "Course" AS ENUM ('EC', 'CC');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('bixe', 'veterane', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "picture" TEXT,
    "course" "Course",
    "pronouns" TEXT[],
    "ethnicity" TEXT[],
    "city" TEXT,
    "lgbt" TEXT[],
    "parties" INTEGER,
    "hobby" TEXT,
    "music" TEXT,
    "games" TEXT,
    "sports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

