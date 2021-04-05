/*
  Warnings:

  - Added the required column `teamOneId` to the `Set` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamTwoId` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "teamOneId" INTEGER NOT NULL,
ADD COLUMN     "teamTwoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Set" ADD FOREIGN KEY ("teamOneId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD FOREIGN KEY ("teamTwoId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
