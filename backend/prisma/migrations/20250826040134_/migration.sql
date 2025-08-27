-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "instagram_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT,
    "profile_picture" TEXT,
    "access_token" TEXT NOT NULL,
    "long_lived_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "posts_count" INTEGER,
    "followers_count" INTEGER,
    "following_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_instagram_user_id_key" ON "User"("instagram_user_id");
