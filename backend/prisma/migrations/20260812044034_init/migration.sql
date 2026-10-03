-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "profilePictureUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instagram_media" (
    "id" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "permalink" TEXT,
    "timestamp" TIMESTAMP(3),
    "aiCommentReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiDmReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instagram_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "mediaId" TEXT,
    "name" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "actionType" TEXT NOT NULL,
    "commentReply" TEXT,
    "dmMessage" TEXT,
    "link" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "fromUsername" TEXT,
    "commentText" TEXT NOT NULL,
    "generatedReply" TEXT,
    "responseType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ruleId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "participantUsername" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "externalMessageId" TEXT,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_configurations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramAccountId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "replyStyle" TEXT NOT NULL DEFAULT 'friendly',
    "businessDescription" TEXT,
    "businessInstructions" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'Friendly and helpful social media assistant',
    "maxResponseLength" INTEGER NOT NULL DEFAULT 150,
    "customInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_accounts_instagramUserId_key" ON "instagram_accounts"("instagramUserId");

-- CreateIndex
CREATE INDEX "instagram_accounts_userId_idx" ON "instagram_accounts"("userId");

-- CreateIndex
CREATE INDEX "instagram_accounts_instagramUserId_idx" ON "instagram_accounts"("instagramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_media_mediaId_key" ON "instagram_media"("mediaId");

-- CreateIndex
CREATE INDEX "instagram_media_instagramAccountId_idx" ON "instagram_media"("instagramAccountId");

-- CreateIndex
CREATE INDEX "instagram_media_mediaId_idx" ON "instagram_media"("mediaId");

-- CreateIndex
CREATE INDEX "special_rules_instagramAccountId_isEnabled_idx" ON "special_rules"("instagramAccountId", "isEnabled");

-- CreateIndex
CREATE INDEX "special_rules_userId_idx" ON "special_rules"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "comments_commentId_key" ON "comments"("commentId");

-- CreateIndex
CREATE INDEX "comments_instagramAccountId_createdAt_idx" ON "comments"("instagramAccountId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "comments_commentId_idx" ON "comments"("commentId");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "conversations_instagramAccountId_idx" ON "conversations"("instagramAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_instagramAccountId_participantId_key" ON "conversations"("instagramAccountId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "messages_externalMessageId_key" ON "messages"("externalMessageId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ai_configurations_userId_idx" ON "ai_configurations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_externalEventId_key" ON "webhook_events"("externalEventId");

-- CreateIndex
CREATE INDEX "webhook_events_externalEventId_idx" ON "webhook_events"("externalEventId");

-- CreateIndex
CREATE INDEX "webhook_events_processed_createdAt_idx" ON "webhook_events"("processed", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "instagram_accounts" ADD CONSTRAINT "instagram_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instagram_media" ADD CONSTRAINT "instagram_media_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "instagram_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_rules" ADD CONSTRAINT "special_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_rules" ADD CONSTRAINT "special_rules_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "instagram_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_rules" ADD CONSTRAINT "special_rules_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "instagram_media"("mediaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "instagram_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "instagram_media"("mediaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "instagram_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_configurations" ADD CONSTRAINT "ai_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_configurations" ADD CONSTRAINT "ai_configurations_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "instagram_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
