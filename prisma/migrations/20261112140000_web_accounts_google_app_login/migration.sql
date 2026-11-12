-- CreateEnum
CREATE TYPE "AppLoginStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'USED');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'app';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AppLogin" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "pollHash" TEXT NOT NULL,
    "status" "AppLoginStatus" NOT NULL DEFAULT 'PENDING',
    "installId" TEXT,
    "userId" TEXT,
    "device" TEXT,
    "ip" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "AppLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppLogin_codeHash_key" ON "AppLogin"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "AppLogin_pollHash_key" ON "AppLogin"("pollHash");

-- CreateIndex
CREATE INDEX "AppLogin_expiresAt_idx" ON "AppLogin"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "AppLogin" ADD CONSTRAINT "AppLogin_installId_fkey" FOREIGN KEY ("installId") REFERENCES "Install"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppLogin" ADD CONSTRAINT "AppLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

