/*
  Warnings:

  - A unique constraint covering the columns `[environment]` on the table `tracos_token` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[tracos_token] ADD [environment] VARCHAR(3);

-- CreateIndex
ALTER TABLE [dbo].[tracos_token] ADD CONSTRAINT [tracos_token_environment_key] UNIQUE NONCLUSTERED ([environment]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
