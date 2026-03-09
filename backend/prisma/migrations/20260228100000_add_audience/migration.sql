CREATE TYPE "Audience" AS ENUM ('man', 'woman', 'child', 'all');

ALTER TABLE "Product"
ADD COLUMN "audience" "Audience" NOT NULL DEFAULT 'all';
