BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[tracos_token] DROP CONSTRAINT [tracos_token_company_id_key];

-- AlterTable
ALTER TABLE [dbo].[tracos_token] ALTER COLUMN [company_id] VARCHAR(255) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[tracos_token] ADD CONSTRAINT [tracos_token_company_id_key] UNIQUE NONCLUSTERED ([company_id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
