-- Add variantGroups to persist variant builder configuration
ALTER TABLE "Product" ADD COLUMN "variantGroups" JSONB;
