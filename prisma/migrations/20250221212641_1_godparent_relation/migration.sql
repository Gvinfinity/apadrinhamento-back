-- CreateTable
CREATE TABLE "godparent_relations" (
    "godparentId" UUID NOT NULL,
    "godchildId" UUID NOT NULL,

    CONSTRAINT "godparent_relations_pkey" PRIMARY KEY ("godparentId","godchildId")
);

-- AddForeignKey
ALTER TABLE "godparent_relations" ADD CONSTRAINT "godparent_relations_godparentId_fkey" FOREIGN KEY ("godparentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "godparent_relations" ADD CONSTRAINT "godparent_relations_godchildId_fkey" FOREIGN KEY ("godchildId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
